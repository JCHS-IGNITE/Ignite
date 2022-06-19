const winston = require('winston');

const logger = winston.createLogger({
  level: 'debug',
  exitOnError: false,
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.splat(),
    winston.format.timestamp(),
    winston.format.align(),
    winston.format.printf((info) => `${info.timestamp} [${info.level}] ${info.message}`),
  ),
  transports: new winston.transports.Console(),
});

module.exports = logger;
