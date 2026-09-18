//Files: src/core/domain/error/UnauthorizedError.ts
import {AppError} from "./AppError";

export class UnauthorizedError extends AppError {
  constructor(message = "Kredensial atau token autentikasi tidak valid.") {
    super(message, 401);
  }
}
