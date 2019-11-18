const config = require('../config/production.conf');
const path = require('path');
const winston = require('winston');

/**
 * Set up logger
 */
exports.logger =  winston.createLogger({
    format: winston.format.combine(
        winston.format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }),
        winston.format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`+(info.splat!==undefined?`${info.splat}`:" "))
    ),
    levels: winston.config.syslog.levels,
    transports: [
      new winston.transports.Console({
          timestamp: true,
          level: 'debug',
          colorize: 'true',
          label: 'development'}),
      new winston.transports.File({
        filename: path.join(global.appRoot, config.applicationLog),
        timestamp: true,
        level: 'debug',
        colorize: 'true',
        label: 'development'
      })
    ]
  });
