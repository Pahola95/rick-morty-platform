const { logger } = require('./logger');

const errorHandler = (err, req, res, next) => {
  logger.error(`${err.message} - ${req.originalUrl}`);
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    message: err.message || 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

const notFound = (req, res, next) => {
  const err = new Error(`Ruta no encontrada: ${req.originalUrl}`);
  err.status = 404;
  next(err);
};

module.exports = { errorHandler, notFound };