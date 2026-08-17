const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    const errors = (result.error.issues ?? result.error.errors ?? []).map((e) => ({
      field:   e.path.length > 0 ? e.path.join('.') : 'general',
      message: e.message,
    }));

    return res.status(400).json({
      status:     'error',
      statusCode: 400,
      message:    'Dữ liệu không hợp lệ',
      errors,
    });
  }

  req.body = result.data;
  next();
};

module.exports = { validate };
