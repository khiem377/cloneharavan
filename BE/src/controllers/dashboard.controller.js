const dashboardService = require('../services/dashboard.service');

const getOverviewStats = async (req, res, next) => {
  try {
    const { period } = req.query;
    const data = await dashboardService.getOverviewStats(period);

    res.json({
      status: 'success',
      statusCode: 200,
      message: 'Lấy dữ liệu tổng quan dashboard thành công',
      data,
    });
  } catch (error) {
    next(error);
  }
};

const searchGlobal = async (req, res, next) => {
  try {
    const { q } = req.query;
    const data = await dashboardService.searchGlobal(q);

    res.json({
      status: 'success',
      statusCode: 200,
      message: 'Tìm kiếm tổng quan thành công',
      data,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOverviewStats,
  searchGlobal,
};
