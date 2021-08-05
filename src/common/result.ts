import logger from '@common/logging';

interface SuccessResult<T> {
  type: 'success';
  data: T;
}

interface FailureResult<T> {
  type: 'error';
  error: T;
  message: string;
}

export function Success<T>(data: T): SuccessResult<T> {
  return {
    type: 'success',
    data: data,
  };
}

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

export type Result<D, E = never> = SuccessResult<D> | FailureResult<E | 'internal'>;
