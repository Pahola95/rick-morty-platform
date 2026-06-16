const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

const requestLogger = (req, res, next) => {
  logger.info(`${req.method} ${req.originalUrl}`);
  logger.info(`Authorization: ${req.headers.authorization ? 'present' : 'missing'}`);
  // Also log raw header to console for debugging
  console.log('RAW_AUTH_HEADER:', req.headers.authorization);
  next();
};

module.exports = { logger, requestLogger };