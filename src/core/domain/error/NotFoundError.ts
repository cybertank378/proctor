//Files: src/core/domain/error/NotFoundError.ts
import { AppError } from "./AppError";

export class NotFoundError extends AppError {
  constructor(message = "Sumber daya yang diminta tidak ditemukan.") {
    super(message, 404);
  }
}
