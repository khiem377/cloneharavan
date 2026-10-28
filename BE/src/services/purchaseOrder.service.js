const PurchaseOrder = require('../models/purchaseOrder.model');
const Product = require('../models/product.model');
const ProductVariant = require('../models/productVariant.model');
const StockMovement = require('../models/stockMovement.model');
const Warehouse = require('../models/warehouse.model');
const ProductWarehouseStock = require('../models/productWarehouseStock.model');
const { uploadRawToCloudinary } = require('../config/cloudinary');
const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');
const AppError = require('../utils/AppError');
const { escapeRegex } = require('../middleware/sanitize.middleware');
const { numberToWordsVN } = require('../utils/vnNumberToWords');
const SupplierDebtService = require('./supplierDebt.service');

class PurchaseOrderService {
    // 1. Lấy danh sách Đơn Nhập Kho
    static async getPurchaseOrders({ page = 1, limit = 20, keyword = '', status, supplierId, warehouseId }) {
        const query = {};
        if (status) query.status = status;
        if (supplierId) query.supplierId = supplierId;
        if (warehouseId) query.warehouseId = warehouseId;
        if (keyword) {
            const safeKw = escapeRegex(keyword);
            query.$or = [
                { poNumber: { $regex: safeKw, $options: 'i' } },
                { note: { $regex: safeKw, $options: 'i' } },
            ];
        }

        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            PurchaseOrder.find(query)
                .populate('supplierId', 'name code phone address email taxCode')
                .populate('warehouseId', 'name code phone address')
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
            .populate('warehouseId', 'name code phone address')
            .populate('createdById', 'name email');
        if (!po) throw new AppError('Đơn nhập kho không tồn tại', 404);
        return po;
    }

    // 3. Tạo Đơn Nhập Kho Mới (Draft hoặc Completed)
    static async createPurchaseOrder(payload, userId) {
        const { supplierId, items, note, deliveryDate, status = 'draft', warehouseId } = payload;
        if (!items || items.length === 0) {
            throw new AppError('Danh sách sản phẩm nhập kho không được để trống', 400);
        }

        let targetWarehouseId = warehouseId;
        if (!targetWarehouseId) {
            const defaultWh = await Warehouse.findOne({ isDefault: true });
            targetWarehouseId = defaultWh?._id;
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
            warehouseId: targetWarehouseId,
            status,
            items: formattedItems,
            totalQuantity,
            totalAmount,
            paidAmount: 0,
            paymentStatus: 'unpaid',
            note: note || '',
            deliveryDate: deliveryDate ? new Date(deliveryDate) : null,
            createdById: userId,
        });

        if (status === 'completed') {
            po.receivedAt = new Date();
            await this.processInventoryIncrement(po, userId);
            await po.save();
            await SupplierDebtService.syncFromPurchaseOrder(po);
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
                await SupplierDebtService.syncFromPurchaseOrder(po);
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

        const pwStockOps = [];

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
                        warehouseId: po.warehouseId,
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

                    if (po.warehouseId) {
                        pwStockOps.push({
                            updateOne: {
                                filter: { warehouseId: po.warehouseId, variantId: item.variantId },
                                update: {
                                    $inc: { stock: item.actualQty },
                                    $setOnInsert: { productId: item.productId, allocated: 0 },
                                },
                                upsert: true,
                            },
                        });
                    }
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
                        warehouseId: po.warehouseId,
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

        // Thực hiện trong DB calls
        await Promise.all([
            variantBulkOps.length > 0 ? ProductVariant.bulkWrite(variantBulkOps) : Promise.resolve(),
            productBulkOps.length > 0 ? Product.bulkWrite(productBulkOps)         : Promise.resolve(),
            pwStockOps.length > 0     ? ProductWarehouseStock.bulkWrite(pwStockOps) : Promise.resolve(),
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
        const po = await PurchaseOrder.findById(id).populate('supplierId').populate('warehouseId');
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
                            cell.value = `Công ty CỔ PHẦN ĐIỆN MÁY SHOP có nhu cầu đặt hàng tại Quý công ty theo mẫu yêu cầu:`;
                        } else if (val.startsWith('Tổng tiền hàng:')) {
                            cell.value = `Tổng tiền hàng: ${totalAmt.toLocaleString('vi-VN')} VNĐ`;
                        } else if (val.startsWith('Thuế VAT')) {
                            cell.value = `Thuế VAT (10%): ${vatAmt.toLocaleString('vi-VN')} VNĐ`;
                        } else if (val.startsWith('Phí vận chuyển')) {
                            cell.value = `Phí vận chuyển: Miễn phí`;
                        } else if (val.startsWith('Tổng tiền thanh toán:')) {
                            const grandTotalWords = numberToWordsVN(grandTotal);
                            cell.value = `Tổng tiền thanh toán: ${grandTotal.toLocaleString('vi-VN')} VNĐ (Bằng chữ: ${grandTotalWords})`;
                        } else if (val.startsWith('Thời gian giao hàng:')) {
                            cell.value = `Thời gian giao hàng: ${po.deliveryDate ? new Date(po.deliveryDate).toLocaleDateString('vi-VN') : 'Dự kiến 3 - 5 ngày làm việc'}`;
                        } else if (val.startsWith('Địa điểm giao hàng:')) {
                            const whName = po.warehouseId?.name || 'Kho Tổng Bình Tân';
                            const whAddr = po.warehouseId?.address?.fullAddress || po.warehouseId?.address?.detailAddress || '38-40 Đường 21A, Phường Bình Trị Đông B, Quận Bình Tân, TP. Hồ Chí Minh';
                            cell.value = `Địa điểm giao hàng: ${whName} - ${whAddr}`;
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
            sheet.getCell('A1').value = 'Đơn vị: CÔNG TY ĐIỆN MÁY SHOP\nBộ phận: Mua Hàng & Cung Ứng';
            sheet.getCell('H6').value = `Số PO: ${po.poNumber}`;
            sheet.getCell('A5').value = dateStr;
            sheet.getCell('A9').value = `- Kính gửi nhà cung cấp: ${supplierName}`;
            sheet.getCell('A10').value = `- Theo Đơn Mua Hàng số ${po.poNumber} của CÔNG TY SHOP`;

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
            subject: `[SHOP] - Đơn Đặt Mua Hàng Mới #${po.poNumber}`,
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

            const emailService = require('./email.service');
            const emailSubject = subject || `[SHOP] - Đơn Đặt Mua Hàng Mới #${po.poNumber}`;
            await emailService.sendPurchaseOrderEmail(po, recipientEmail, emailSubject, customNote);

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

    // 8. Tạo và xuất Excel xem trước (không lưu lại PO rác)
    static async previewExcelSlip(payload, userId) {
        const tempPO = await this.createPurchaseOrder(
            { ...payload, status: 'draft' },
            userId
        );
        const { workbook } = await this.generateExcelSlip(tempPO._id);
        await PurchaseOrder.findByIdAndDelete(tempPO._id);
        return { workbook };
    }

    // 9. Xác nhận thanh toán trực tiếp cho Đơn Mua Hàng / Nhập Kho (P2P Standard)
    static async recordPOPayment(id, payload, userId) {
        const po = await PurchaseOrder.findById(id).populate('supplierId');
        if (!po) throw new AppError('Đơn mua hàng không tồn tại', 404);

        if (po.status === 'cancelled') {
            throw new AppError('Không thể thanh toán cho đơn hàng đã bị hủy', 400);
        }

        const payAmount = Number(payload.amount);
        if (!payAmount || payAmount <= 0) {
            throw new AppError('Số tiền thanh toán phải lớn hơn 0', 400);
        }

        const currentPaid = Number(po.paidAmount || 0);
        const remainingAmount = Math.max(0, (po.totalAmount || 0) - currentPaid);

        if (payAmount > remainingAmount) {
            throw new AppError(
                `Số tiền thanh toán (${payAmount.toLocaleString('vi-VN')}đ) vượt quá số tiền còn cần trả (${remainingAmount.toLocaleString('vi-VN')}đ)`,
                400
            );
        }

        // Đảm bảo khoản công nợ của PO đã tồn tại trong SupplierDebt
        let debt = await SupplierDebtService.syncFromPurchaseOrder(po);
        if (!debt) {
            throw new AppError('Không tìm thấy hoặc không thể tạo bản ghi công nợ cho đơn hàng này', 500);
        }

        // Thực hiện thanh toán công nợ qua SupplierDebtService (tạo phiếu chi & trừ nợ NCC)
        const supplierIdToPay = po.supplierId?._id || po.supplierId;
        const paymentResult = await SupplierDebtService.payDebt(
            supplierIdToPay,
            debt._id,
            {
                amount: payAmount,
                warehouseId: payload.warehouseId || po.warehouseId,
                paymentMethod: payload.paymentMethod || 'bank_transfer',
                voucherType: 'payment',
                description: payload.description || `Thanh toán cho Đơn nhập hàng ${po.poNumber}`,
                note: payload.note || '',
                accountingRecorded: payload.accountingRecorded !== false,
            },
            { _id: userId }
        );

        // Cập nhật trạng thái thanh toán trên PO
        po.paidAmount = currentPaid + payAmount;
        po.paymentStatus = po.paidAmount >= po.totalAmount ? 'paid' : 'partially_paid';
        await po.save();

        return {
            po,
            transaction: paymentResult.transaction,
            debt: paymentResult.debt,
            currentSupplierDebt: paymentResult.currentSupplierDebt,
        };
    }
}

module.exports = PurchaseOrderService;
