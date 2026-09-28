const sanitizeValue = (val) => {
  if (val === null || val === undefined) return val;

  if (Array.isArray(val)) {
    return val.map((item) => sanitizeValue(item));
  }

  if (typeof val === 'object' && !(val instanceof Date) && !(val instanceof RegExp)) {
    const cleanObj = {};
    for (const key of Object.keys(val)) {
      if (key.startsWith('$') || key.includes('.')) {
        continue;
      }
      cleanObj[key] = sanitizeValue(val[key]);
    }
    return cleanObj;
  }

  if (typeof val === 'string') {
    return val.replace(/^\$/, '');
  }

  return val;
};

const sanitizeInput = (req, res, next) => {
  if (req.body) req.body = sanitizeValue(req.body);
  if (req.query) req.query = sanitizeValue(req.query);
  if (req.params) req.params = sanitizeValue(req.params);
  next();
};

module.exports = { sanitizeInput, sanitizeValue };
