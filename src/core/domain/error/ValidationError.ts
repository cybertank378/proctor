//Files: src/core/domain/error/ValidationError.ts
import {AppError} from "./AppError";

export class ValidationError extends AppError {
  public readonly errors?: Record<string, string | readonly string[]>;

  constructor(
    message = "Validasi data gagal.",
    errors?: Record<string, string | readonly string[]>,
  ) {
    super(message, 422);
    this.errors = errors;
  }
}
