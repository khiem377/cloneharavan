const stripHtml = (html = '') =>
  html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

module.exports = { stripHtml };
