const PurchaseOrder = require('../models/purchaseOrder.model');
const PurchaseReturn = require('../models/purchaseReturn.model');
const StockExport = require('../models/stockExport.model');
const StockAudit = require('../models/stockAudit.model');

class StockDocumentService {
  static async getAllDocuments({ docType = '', search = '', page = 1, limit = 10 }) {
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;

    const [pos, prs, exports, audits] = await Promise.all([
      PurchaseOrder.find({}).populate('supplierId', 'name').sort({ createdAt: -1 }),
      PurchaseReturn.find({}).populate('supplierId', 'name').sort({ createdAt: -1 }),
      StockExport.find({}).sort({ createdAt: -1 }),
      StockAudit.find({}).sort({ createdAt: -1 }),
    ]);

    let list = [];

    // Map Purchase Orders
    pos.forEach((po) => {
      list.push({
        id: po._id,
        code: po.poNumber,
        docType: 'PO',
        docTypeName: 'Đơn Nhập Kho (PO)',
        partnerName: po.supplierId?.name || 'Nhà Cung Cấp',
        totalQty: po.totalQuantity || 0,
        totalAmount: po.totalAmount || 0,
        status: po.status,
        statusName: po.status === 'completed' ? 'Đã nhập kho' : po.status === 'draft' ? 'Bản nháp' : 'Đang xử lý',
        createdAt: po.createdAt,
        previewUrl: `purchase-orders/${po._id}/download-excel`,
      });
    });

    // Map Purchase Returns
    prs.forEach((pr) => {
      list.push({
        id: pr._id,
        code: pr.returnNumber,
        docType: 'PR',
        docTypeName: 'Trả Hàng Nhập (PR)',
        partnerName: pr.supplierName || pr.supplierId?.name || 'Nhà Cung Cấp',
        totalQty: pr.totalQuantity || 0,
        totalAmount: pr.totalAmount || 0,
        status: pr.status,
        statusName: pr.status === 'completed' ? 'Đã xuất trả' : 'Bản nháp',
        createdAt: pr.createdAt,
        previewUrl: `purchase-returns/${pr._id}/download-excel`,
      });
    });

    // Map Stock Exports
    exports.forEach((ex) => {
      list.push({
        id: ex._id,
        code: ex.exportNumber,
        docType: 'EX',
        docTypeName: 'Phiếu Xuất Kho',
        partnerName: ex.recipientName || 'Khách hàng / Đối tác',
        totalQty: ex.totalQuantity || 0,
        totalAmount: ex.totalAmount || 0,
        status: ex.status,
        statusName: ex.status === 'completed' ? 'Đã xuất kho' : 'Đang xử lý',
        createdAt: ex.createdAt,
        previewUrl: `stock-exports/${ex._id}/download-excel`,
      });
    });

    // Map Stock Audits
    audits.forEach((aud) => {
      list.push({
        id: aud._id,
        code: aud.auditNumber,
        docType: 'AUD',
        docTypeName: 'Phiếu Kiểm Kê Kho',
        partnerName: 'Thủ Kho Kiểm Kê',
        totalQty: aud.items?.reduce((acc, i) => acc + (i.actualStock || 0), 0) || 0,
        totalAmount: 0,
        status: 'completed',
        statusName: 'Đã cân bằng kho',
        createdAt: aud.auditDate || aud.createdAt,
        previewUrl: `stock-audits/${aud._id}/download-excel`,
      });
    });

    // Filter by docType
    if (docType && docType !== 'ALL') {
      list = list.filter((d) => d.docType === docType);
    }

    // Search filter
    if (search) {
      const s = search.toLowerCase();
      list = list.filter(
        (d) =>
          d.code.toLowerCase().includes(s) ||
          d.partnerName.toLowerCase().includes(s) ||
          d.docTypeName.toLowerCase().includes(s)
      );
    }

    // Sort descending by createdAt
    list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const total = list.length;
    const startIndex = (pageNum - 1) * limitNum;
    const paginatedItems = list.slice(startIndex, startIndex + limitNum);

    return {
      items: paginatedItems,
      summary: {
        totalDocuments: list.length,
        totalPO: pos.length,
        totalPR: prs.length,
        totalExport: exports.length,
        totalAudit: audits.length,
      },
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    };
  }
}

module.exports = StockDocumentService;
