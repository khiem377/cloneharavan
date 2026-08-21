const flashSaleService = require('../services/flashSale.service');

const create = async (req, res, next) => {
  try {
    const flashSale = await flashSaleService.createFlashSale(req.body);
    res.status(201).json({
      status: 'success',
      statusCode: 201,
      message: 'Tạo chương trình Flash Sale thành công',
      data: flashSale,
    });
  } catch (error) {
    next(error);
  }
};

const getAll = async (req, res, next) => {
  try {
    const result = await flashSaleService.getAllFlashSales(req.query);
    res.json({
      status: 'success',
      statusCode: 200,
      message: 'Lấy danh sách Flash Sale thành công',
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const flashSale = await flashSaleService.getFlashSaleById(req.params.id);
    res.json({
      status: 'success',
      statusCode: 200,
      message: 'Lấy chi tiết Flash Sale thành công',
      data: flashSale,
    });
  } catch (error) {
    next(error);
  }
};

const getActive = async (req, res, next) => {
  try {
    const flashSale = await flashSaleService.getActiveFlashSale();
    res.json({
      status: 'success',
      statusCode: 200,
      message: 'Lấy Flash Sale đang diễn ra thành công',
      data: flashSale,
    });
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const flashSale = await flashSaleService.updateFlashSale(req.params.id, req.body);
    res.json({
      status: 'success',
      statusCode: 200,
      message: 'Cập nhật Flash Sale thành công',
      data: flashSale,
    });
  } catch (error) {
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    await flashSaleService.deleteFlashSale(req.params.id);
    res.json({
      status: 'success',
      statusCode: 200,
      message: 'Xóa chương trình Flash Sale thành công',
    });
  } catch (error) {
    next(error);
  }
};

const toggleStatus = async (req, res, next) => {
  try {
    const { isActive } = req.body;
    const flashSale = await flashSaleService.toggleFlashSaleStatus(req.params.id, isActive);
    res.json({
      status: 'success',
      statusCode: 200,
      message: `Đã ${isActive ? 'bật' : 'tắt'} chương trình Flash Sale`,
      data: flashSale,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  create,
  getAll,
  getById,
  getActive,
  update,
  remove,
  toggleStatus,
};
