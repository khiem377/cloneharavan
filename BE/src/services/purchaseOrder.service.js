const PurchaseOrder = require('../models/purchaseOrder.model');
const Product = require('../models/product.model');
const ProductVariant = require('../models/productVariant.model');
const StockMovement = require('../models/stockMovement.model');
const { uploadRawToCloudinary } = require('../config/cloudinary');
const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');
const AppError = require('../utils/AppError');

class PurchaseOrderService {
    // 1. Lấy danh sách Đơn Nhập Kho
    static async getPurchaseOrders({ page = 1, limit = 20, keyword = '', status, supplierId }) {
        const query = {};
        if (status) query.status = status;
        if (supplierId) query.supplierId = supplierId;
        if (keyword) {
            query.$or = [
                { poNumber: { $regex: keyword, $options: 'i' } },
                { note: { $regex: keyword, $options: 'i' } },
            ];
        }

        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            PurchaseOrder.find(query)
                .populate('supplierId', 'name code phone address email taxCode')
                .populate('createdById', 'name email')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit)),
            PurchaseOrder.countDocuments(query),
        ]);

        return {
            data,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                totalPages: Math.ceil(total / limit) || 1,
            },
        };
    }

    // 2. Chi tiết Đơn Nhập Kho
    static async getPurchaseOrderById(id) {
        const po = await PurchaseOrder.findById(id)
            .populate('supplierId')
            .populate('createdById', 'name email');
        if (!po) throw new AppError('Đơn nhập kho không tồn tại', 404);
        return po;
    }

    // 3. Tạo Đơn Nhập Kho Mới (Draft hoặc Completed)
    static async createPurchaseOrder(payload, userId) {
        const { supplierId, items, note, deliveryDate, status = 'draft' } = payload;
        if (!items || items.length === 0) {
            throw new AppError('Danh sách sản phẩm nhập kho không được để trống', 400);
        }

        const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const count = await PurchaseOrder.countDocuments();
        const poNumber = `PO-${dateStr}-${String(count + 1).padStart(3, '0')}`;

        let totalQuantity = 0;
        let totalAmount = 0;

        const formattedItems = items.map((item) => {
            const exp = Number(item.expectedQty || 1);
            const act = Number(item.actualQty ?? exp);
            const price = Number(item.importPrice || 0);
            const sub = act * price;

            totalQuantity += act;
            totalAmount += sub;

            return {
                productId: item.productId,
                variantId: item.variantId || null,
                sku: item.sku || '',
                productName: item.productName || 'Sản phẩm',
                unit: item.unit || 'Cái',
                expectedQty: exp,
                actualQty: act,
                importPrice: price,
                subtotal: sub,
            };
        });

        const po = await PurchaseOrder.create({
            poNumber,
            supplierId,
            status,
            items: formattedItems,
            totalQuantity,
            totalAmount,
            note: note || '',
            deliveryDate: deliveryDate ? new Date(deliveryDate) : null,
            createdById: userId,
        });

        if (status === 'completed') {
            po.receivedAt = new Date();
            await this.processInventoryIncrement(po, userId);
            await po.save();
        }

        return po;
    }

    // 4. Cập nhật trạng thái Đơn Nhập Kho
    static async updatePurchaseOrderStatus(id, payload, userId) {
        const po = await PurchaseOrder.findById(id);
        if (!po) throw new AppError('Đơn nhập kho không tồn tại', 404);

        if (po.status === 'completed') {
            throw new AppError('Đơn nhập kho đã hoàn thành nhập kho, không thể thay đổi trạng thái', 400);
        }

        const { status, items } = typeof payload === 'object' ? payload : { status: payload };

        if (items && Array.isArray(items) && items.length > 0) {
            po.items = items.map((i) => ({
                ...i,
                subtotal: (i.actualQty || 0) * (i.importPrice || 0),
            }));
            po.totalQuantity = po.items.reduce((acc, item) => acc + item.actualQty, 0);
            po.totalAmount = po.items.reduce((acc, item) => acc + item.subtotal, 0);
        }

        if (status) {
            po.status = status;
            if (status === 'completed') {
                po.receivedAt = new Date();
                await this.processInventoryIncrement(po, userId);
            }
        }

        await po.save();
        return po;
    }

    // 🔥 Helper: Cộng Tồn Kho & Ghi Nhật Ký StockMovement Log & Cloud Archiving
    // ✔ FIX: nếu có variantId → chỉ cộng variant.stock, KHÔNG cộng product.stock (tránh double-count)
    static async processInventoryIncrement(po, userId) {
        // ── Batch pre-fetch: lấy tất cả variants và products trong 2 DB calls ──
        const variantIds = po.items.filter((i) => i.variantId).map((i) => i.variantId);
        const productIds = po.items.filter((i) => !i.variantId && i.productId).map((i) => i.productId);

        const [variantsList, productsList] = await Promise.all([
            variantIds.length > 0 ? ProductVariant.find({ _id: { $in: variantIds } }) : [],
            productIds.length > 0 ? Product.find({ _id: { $in: productIds } }) : [],
        ]);

        const variantMap = new Map(variantsList.map((v) => [v._id.toString(), v]));
        const productMap = new Map(productsList.map((p) => [p._id.toString(), p]));

        const variantBulkOps = [];
        const productBulkOps = [];
        const movementDocs   = [];

        for (const item of po.items) {
            if (item.variantId) {
                const variant = variantMap.get(item.variantId.toString());
                if (variant) {
                    const beforeStock = variant.stock || 0;
                    const afterStock  = beforeStock + item.actualQty;
                    variantBulkOps.push({
                        updateOne: {
                            filter: { _id: item.variantId },
                            update: { $set: { stock: afterStock } },
                        },
                    });
                    movementDocs.push({
                        type: 'IMPORT',
                        productId: item.productId,
                        variantId: item.variantId,
                        sku: item.sku,
                        productName: item.productName,
                        beforeStock,
                        changeQty: item.actualQty,
                        afterStock,
                        referenceNumber: po.poNumber,
                        reason: `Nhập kho từ đơn ${po.poNumber}`,
                        createdById: userId,
                    });
                }
            } else {
                const product = productMap.get(item.productId.toString());
                if (product) {
                    const beforeStock = product.stock || 0;
                    const afterStock  = beforeStock + item.actualQty;
                    productBulkOps.push({
                        updateOne: {
                            filter: { _id: item.productId },
                            update: { $set: { stock: afterStock } },
                        },
                    });
                    movementDocs.push({
                        type: 'IMPORT',
                        productId: item.productId,
                        sku: item.sku,
                        productName: item.productName,
                        beforeStock,
                        changeQty: item.actualQty,
                        afterStock,
                        referenceNumber: po.poNumber,
                        reason: `Nhập kho từ đơn ${po.poNumber}`,
                        createdById: userId,
                    });
                }
            }
        }

        // Thực hiện trong 3 DB calls thay vì N*3 calls
        await Promise.all([
            variantBulkOps.length > 0 ? ProductVariant.bulkWrite(variantBulkOps) : Promise.resolve(),
            productBulkOps.length > 0 ? Product.bulkWrite(productBulkOps)         : Promise.resolve(),
            movementDocs.length > 0   ? StockMovement.insertMany(movementDocs, { ordered: false }) : Promise.resolve(),
        ]);

        try {
            const { workbook } = await this.generateExcelSlip(po._id);
            const buffer = await workbook.xlsx.writeBuffer();
            const folderPath = `inventory_archives/purchase_orders`;
            const result = await uploadRawToCloudinary(buffer, folderPath);
            if (result?.secure_url) {
                po.documentUrl = result.secure_url;
                po.documentPublicId = result.public_id;
                await po.save();
            }
        } catch (err) {
            console.error(`[Archive-Error] Upload PO ${po.poNumber} to Cloudinary failed:`, err.message);
        }
    }

    // 5. 🔥 ĐIỀN DỮ LIỆU CHUẨN VÀO TEMPLATE EXCEL 'mau-don-dat-hang.xlsx' (ĐƠN ĐẶT HÀNG PO)
    static async generateExcelSlip(id) {
        const po = await PurchaseOrder.findById(id).populate('supplierId');
        if (!po) throw new AppError('Đơn mua hàng không tồn tại', 404);

        let templatePath = path.join(__dirname, '../template/mau-don-dat-hang.xlsx');
        if (!fs.existsSync(templatePath)) {
            templatePath = path.join(__dirname, '../template/phieu nhap kho.xlsx');
        }

        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile(templatePath);
        const sheet = workbook.worksheets[0];

        const d = new Date(po.createdAt);
        const dateStr = `Ngày ${String(d.getDate()).padStart(2, '0')} tháng ${String(d.getMonth() + 1).padStart(2, '0')} năm ${d.getFullYear()}`;
        const supplierName = po.supplierId?.name || 'Nhà cung cấp';
        const supplierAddress = po.supplierId?.address || 'Việt Nam';

        // Check template type
        if (fs.existsSync(path.join(__dirname, '../template/mau-don-dat-hang.xlsx')) && templatePath.includes('mau-don-dat-hang')) {
            const totalAmt = po.totalAmount || 0;
            const vatAmt = Math.round(totalAmt * 0.1);
            const grandTotal = totalAmt + vatAmt;

            const dateObj = new Date(po.createdAt || Date.now());
            const dateText = `Hà Nội, ngày ${String(dateObj.getDate()).padStart(2, '0')} tháng ${String(dateObj.getMonth() + 1).padStart(2, '0')} năm ${dateObj.getFullYear()}`;

            // Helper to extract text from primitive, richText, or object cells
            const getCellText = (cellVal) => {
                if (!cellVal) return '';
                if (typeof cellVal === 'string') return cellVal;
                if (typeof cellVal === 'number') return String(cellVal);
                if (typeof cellVal === 'object' && cellVal.richText && Array.isArray(cellVal.richText)) {
                    return cellVal.richText.map((t) => t.text || '').join('');
                }
                if (typeof cellVal === 'object' && cellVal.result) {
                    return String(cellVal.result);
                }
                return String(cellVal);
            };

            // 1. Scan and fill all static text cells & placeholders
            sheet.eachRow((row) => {
                row.eachCell((cell) => {
                    const val = getCellText(cell.value).trim();
                    if (val) {
                        if (val.startsWith('Số:')) {
                            cell.value = `Số: ${po.poNumber}`;
                        } else if (val.startsWith('Kính gửi:')) {
                            cell.value = `Kính gửi: Quý công ty ${supplierName}`;
                        } else if (val.startsWith('Công ty') && val.includes('có nhu cầu đặt hàng')) {
                            cell.value = `Công ty CỔ PHẦN ĐIỆN MÁY EGA  có nhu cầu đặt hàng tại Quý công ty theo mẫu yêu cầu:`;
                        } else if (val.startsWith('Tổng tiền hàng:')) {
                            cell.value = `Tổng tiền hàng: ${totalAmt.toLocaleString('vi-VN')} VNĐ`;
                        } else if (val.startsWith('Thuế VAT')) {
                            cell.value = `Thuế VAT (10%): ${vatAmt.toLocaleString('vi-VN')} VNĐ`;
                        } else if (val.startsWith('Phí vận chuyển')) {
                            cell.value = `Phí vận chuyển: Miễn phí`;
                        } else if (val.startsWith('Tổng tiền thanh toán:')) {
                            cell.value = `Tổng tiền thanh toán: ${grandTotal.toLocaleString('vi-VN')} VNĐ`;
                        } else if (val.startsWith('Thời gian giao hàng:')) {
                            cell.value = `Thời gian giao hàng: ${po.deliveryDate ? new Date(po.deliveryDate).toLocaleDateString('vi-VN') : 'Dự kiến 3 - 5 ngày làm việc'}`;
                        } else if (val.startsWith('Địa điểm giao hàng:')) {
                            cell.value = `Địa điểm giao hàng: Kho Thành Phẩm EGA  - Tầng 35, Keangnam Hanoi Landmark Tower, Q.Nam Từ Liêm, Hà Nội`;
                        } else if (val.includes('ngày') && val.includes('tháng') && val.includes('năm')) {
                            cell.value = dateText;
                        }
                    }
                });
            });

            // 2. Populate Product Items starting at Row 9
            const startRow = 9;
            po.items.forEach((item, index) => {
                const currentRow = sheet.getRow(startRow + index);
                currentRow.getCell(1).value = index + 1; // STT
                currentRow.getCell(2).value = item.productName; // Tên sản phẩm
                currentRow.getCell(3).value = item.sku || ''; // Mã sản phẩm
                currentRow.getCell(4).value = item.expectedQty || 1; // Số lượng
                currentRow.getCell(5).value = item.importPrice || 0; // Đơn giá
                currentRow.getCell(6).value = item.subtotal || 0; // Thành tiền
                currentRow.commit();
            });
        } else {
            // Fallback
            sheet.getCell('A1').value = 'Đơn vị: CÔNG TY ĐIỆN MÁY EGA \nBộ phận: Mua Hàng & Cung Ứng';
            sheet.getCell('H6').value = `Số PO: ${po.poNumber}`;
            sheet.getCell('A5').value = dateStr;
            sheet.getCell('A9').value = `- Kính gửi nhà cung cấp: ${supplierName}`;
            sheet.getCell('A10').value = `- Theo Đơn Mua Hàng số ${po.poNumber} của CÔNG TY EGA`;

            const startRow = 15;
            po.items.forEach((item, index) => {
                const currentRow = sheet.getRow(startRow + index);
                currentRow.getCell(1).value = index + 1;
                currentRow.getCell(2).value = item.productName;
                currentRow.getCell(3).value = item.sku || '';
                currentRow.getCell(4).value = item.unit || 'Cái';
                currentRow.getCell(5).value = item.expectedQty || 1;
                currentRow.getCell(6).value = item.receivedQty || item.actualQty || 0;
                currentRow.getCell(7).value = item.importPrice || 0;
                currentRow.getCell(8).value = item.subtotal || 0;
                currentRow.commit();
            });
        }

        return { workbook, poNumber: po.poNumber };
    }

    // 6. 🔥 PREVIEW EMAIL PO HTML FOR FRONTEND MODAL
    static async previewPOEmail(id) {
        const po = await PurchaseOrder.findById(id).populate('supplierId');
        if (!po) throw new AppError('Đơn nhập kho không tồn tại', 404);

        const { generatePOEmailHTML } = require('../utils/poEmailTemplate');
        const html = generatePOEmailHTML({ po, supplier: po.supplierId });

        return {
            poId: po._id,
            poNumber: po.poNumber,
            supplierName: po.supplierId?.name || 'Nhà cung cấp',
            supplierEmail: po.supplierId?.email || '',
            supplierPhone: po.supplierId?.phone || '',
            subject: `[EGA] - Đơn Đặt Mua Hàng Mới #${po.poNumber}`,
            html,
        };
    }

    // 7. 🔥 XỬ LÝ GỬI PO CHO NCC (EMAIL HOẶC THỦ CÔNG)
    static async sendPOToSupplier(id, payload, userId) {
        const po = await PurchaseOrder.findById(id).populate('supplierId');
        if (!po) throw new AppError('Đơn nhập kho không tồn tại', 404);

        const { sendMethod = 'email', recipientEmail, subject, customNote, manualNote } = payload;

        if (sendMethod === 'email') {
            if (!recipientEmail || !recipientEmail.includes('@')) {
                throw new AppError('Địa chỉ email nhà cung cấp không hợp lệ', 400);
            }

            const sendEmail = require('../utils/sendEmail');
            const { generatePOEmailHTML } = require('../utils/poEmailTemplate');
            const html = generatePOEmailHTML({ po, supplier: po.supplierId, customNote });

            const emailSubject = subject || `[EGA] - Đơn Đặt Mua Hàng Mới #${po.poNumber}`;
            await sendEmail({ to: recipientEmail, subject: emailSubject, html });

            // Update PO status to 'sent'
            po.status = 'sent';
            const timeStr = new Date().toLocaleString('vi-VN');
            const dispatchLog = `[Email-Dispatch] Đã gửi PO tới ${recipientEmail} vào ${timeStr}.`;
            po.note = po.note ? `${po.note}\n${dispatchLog}` : dispatchLog;
            await po.save();
        } else {
            // Manual dispatch (Zalo / Phone)
            po.status = 'sent';
            const timeStr = new Date().toLocaleString('vi-VN');
            const noteContent = manualNote || 'Đã liên hệ chốt đơn qua Zalo / Số điện thoại';
            const dispatchLog = `[Manual-Dispatch] ${noteContent} (${timeStr}).`;
            po.note = po.note ? `${po.note}\n${dispatchLog}` : dispatchLog;
            await po.save();
        }

        return po;
    }
}

module.exports = PurchaseOrderService;
