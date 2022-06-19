const logger = require('../../provider/loggerProvider');

module.exports = (req, res, next) => {
  logger.info(`[Web] ${req.ip} ${res.statusCode} ${req.method} ${req.originalUrl} `);
  next();
};
