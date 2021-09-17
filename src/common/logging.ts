import winston, { Logger } from 'winston';

const { combine, timestamp, printf } = winston.format;

const customFormat = printf(({ level, message, timestamp, moduleName }) => {
  return `[${moduleName}] ${timestamp} - ${level}: ${message}`;
});

const logger = winston.createLogger({
  level: 'info',
  format: combine(timestamp(), customFormat),
  transports: [
    //
    // - Write all logs with level `error` and below to `error.log`
    // - Write all logs with level `info` and below to `combined.log`
    //
    new winston.transports.File({
      filename: 'log/error.log',
      level: 'error',
      handleExceptions: true,
    }),
    new winston.transports.File({ filename: 'log/combined.log' }),
  ],
});

//
// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
//
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      level: 'debug',
      format: combine(timestamp(), customFormat),
      handleExceptions: true,
    })
  );
}

const getLogger = function (name: string): Logger {
  return logger.child({ moduleName: name });
};

export default getLogger;
