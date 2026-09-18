//Files: src/core/domain/error/ForbiddenError.ts
import {AppError} from "./AppError";

export class ForbiddenError extends AppError {
  constructor(message = "Akses terlarang. Anda tidak memiliki izin.") {
    super(message, 403);
  }
}
