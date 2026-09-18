//Files: src/core/domain/error/ConflictError.ts
import {AppError} from "./AppError";

export class ConflictError extends AppError {
  constructor(message = "Terjadi konflik pada status entitas.") {
    super(message, 409);
  }
}
