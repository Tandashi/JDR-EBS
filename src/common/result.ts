import getLogger from '@common/logging';
const logger = getLogger('Result');

/**
 * The success Result
 */
export interface SuccessResult<T> {
  /**
   * The type of the result
   */
  type: 'success';
  /**
   * The data of the success result
   */
  data: T;
}

/**
 * The failure Result
 */
export interface FailureResult<T> {
  /**
   * The type of the result
   */
  type: 'error';
  /**
   * The error type
   */
  error: T;
  /**
   * The failure message
   */
  message: string;
}

/**
 * Create a {@link SuccessResult successful Result} with given Data.
 *
 * @param data The data of the Result
 *
 * @returns The Success Result
 */
export function Success<T>(data: T): SuccessResult<T> {
  return {
    type: 'success',
    data: data,
  };
}

/**
 * Create a {@link FailureResult failure Result} with given error type and message.
 *
 * @param error The error type
 * @param message The failure message
 *
 * @returns The Success Result
 */
export function Failure<T>(error: T | 'internal', message: string): FailureResult<T | 'internal'> {
  if (error === 'internal') {
    logger.error(message);
  }

  return {
    type: 'error',
    error: error,
    message: message,
  };
}

/**
 * The Result of an Operation
 */
export type Result<D, E = never> = SuccessResult<D> | FailureResult<E | 'internal'>;
