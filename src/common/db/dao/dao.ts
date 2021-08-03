interface DBSuccessResult<T> {
  type: 'success';
  data: T;
}

interface DBFailureResult<T> {
  type: 'error';
  error: T;
  message: string;
}

export function Success<T>(data: T): DBSuccessResult<T> {
  return {
    type: 'success',
    data: data,
  };
}

export function Failure<T>(error: T, message: string): DBFailureResult<T> {
  return {
    type: 'error',
    error: error,
    message: message,
  };
}

export type DBResult<D, E = never> = DBSuccessResult<D> | DBFailureResult<E | 'internal'>;
