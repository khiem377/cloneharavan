const StockDocumentService = require('../services/stockDocument.service');

const getAllDocuments = async (req, res, next) => {
  try {
    const result = await StockDocumentService.getAllDocuments(req.query);
    res.status(200).json({
      status: 'success',
      data: result.items,
      summary: result.summary,
      pagination: result.pagination,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllDocuments,
};
