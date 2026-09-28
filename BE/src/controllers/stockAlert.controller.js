const StockAlertService = require('../services/stockAlert.service');

const getLowStockItems = async (req, res, next) => {
  try {
    const result = await StockAlertService.getLowStockItems(req.query);
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

const updateCostPrice = async (req, res, next) => {
  try {
    const product = await StockAlertService.updateCostPrice(req.params.id, req.body.costPrice);
    res.status(200).json({
      status: 'success',
      message: 'Cập nhật giá nhập vốn thành công',
      data: product,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getLowStockItems,
  updateCostPrice,
};
