//Files: src/core/application/result/AppResult.ts
export class AppResult<T> {
  public readonly isSuccess: boolean;
  public readonly isFailure: boolean;
  public readonly data?: T;
  public readonly error?: string;
  public readonly message?: string;
  public readonly statusCode: number;

  constructor(
    isSuccess: boolean,
    statusCode: number,
    data?: T,
    error?: string,
    message?: string,
  ) {
    this.isSuccess = isSuccess;
    this.isFailure = !isSuccess;
    this.statusCode = statusCode;
    this.data = data;
    this.error = error;
    this.message = message;
  }
}
