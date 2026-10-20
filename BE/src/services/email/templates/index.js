const orderTemplates = require('./orderTemplates');
const shippingTemplates = require('./shippingTemplates');
const accountTemplates = require('./accountTemplates');
const procurementTemplates = require('./procurementTemplates');
const { getStoreEmailConfig } = require('../config');
const { emailShell, getCategoryLabel } = require('../layout');

/**
 * Danh sách toàn bộ 12 mẫu email chuẩn Sapo của hệ thống
 */
const EMAIL_TEMPLATES_CONFIG = [
  ...orderTemplates,
  ...shippingTemplates,
  ...accountTemplates,
  ...procurementTemplates,
];

const { getRealSampleOrderData } = require('../sampleData');

/**
 * Render đầy đủ Email theo templateId (dùng cho cả Live Preview lẫn Gửi thật)
 */
const renderEmailTemplate = async (templateId, data = {}) => {
  const config = await getStoreEmailConfig();
  const tmpl = EMAIL_TEMPLATES_CONFIG.find((t) => t.id === templateId) || EMAIL_TEMPLATES_CONFIG[0];

  // Nếu là preview hoặc chưa có đơn hàng thật -> Chọc DB lấy 1 sản phẩm thật + 1 combo thật
  let effectiveData = { ...data };
  if (!effectiveData.order && (tmpl.group === 'order' || tmpl.group === 'shipping')) {
    const sampleOrder = await getRealSampleOrderData();
    effectiveData = {
      ...effectiveData,
      order: sampleOrder,
      customerName: sampleOrder.customerName,
      customerEmail: sampleOrder.customerEmail,
      orderCode: sampleOrder.orderCode,
    };
  }

  const logoUrl = effectiveData.logoUrl !== undefined ? effectiveData.logoUrl : config.logoUrl;
  const logoWidth = effectiveData.logoWidth ? Number(effectiveData.logoWidth) : config.logoWidth;
  const primaryColor = effectiveData.primaryColor || config.primaryColor;

  const savedCustom = (config.customTemplates && config.customTemplates[templateId]) || {};
  const custom = effectiveData.customConfig || savedCustom || {};

  const rendered = tmpl.render({
    shopName: config.shopName,
    primaryColor,
    data: effectiveData,
    custom,
  });

  const fullHtml = emailShell({
    shopName: config.shopName,
    supportEmail: config.supportEmail,
    logoUrl,
    logoWidth,
    primaryColor,
    categoryLabel: getCategoryLabel(tmpl.group),
    bodyHtml: rendered.bodyHtml,
  });

  return {
    template: tmpl,
    subject: rendered.subject,
    html: fullHtml,
    defaults: tmpl.defaults || {},
    availableVariables: tmpl.availableVariables || [],
    custom,
    branding: {
      logoUrl,
      logoWidth,
      primaryColor,
    },
  };
};

module.exports = {
  EMAIL_TEMPLATES_CONFIG,
  renderEmailTemplate,
};
