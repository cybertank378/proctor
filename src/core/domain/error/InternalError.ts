//Files: src/core/domain/error/InternalError.ts
import { AppError } from "./AppError";

export class InternalError extends AppError {
  constructor(message = "Terjadi kegagalan internal pada sistem.") {
    super(message, 500);
  }
}
