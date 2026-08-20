const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    const errors = (result.error.issues ?? result.error.errors ?? []).map((e) => ({
      field: e.path.length > 0 ? e.path.join('.') : 'general',
      message: e.message,
    }));


    const mainMessage = errors[0]?.message || 'Vui lòng kiểm tra lại thông tin';

    return res.status(400).json({
      status: 'error',
      statusCode: 400,
      message: mainMessage,
      errors,
    });
  }

  req.body = result.data;
  next();
};

module.exports = { validate };
