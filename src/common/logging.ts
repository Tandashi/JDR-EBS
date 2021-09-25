import winston, { Logger } from 'winston';

const { combine, timestamp, printf } = winston.format;

const customFormat = printf(({ level, message, timestamp, moduleName }) => {
  return `[${moduleName}] ${timestamp} - ${level}: ${message}`;
});

// The base logger
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

/**
 * Get the Logger for a module.
 *
 * @param name The name of the module
 *
 * @returns The Logger for the module
 */
const getLogger = function (name: string): Logger {
  // Create a child of the base logger with moduleName parameter
  return logger.child({ moduleName: name });
};

export default getLogger;
