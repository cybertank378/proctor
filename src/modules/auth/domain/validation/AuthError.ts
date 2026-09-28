//Files: src/modules/auth/domain/validation/AuthError.ts
import { AppError } from "@/core/domain/error/AppError";

export class AuthError extends AppError {
  constructor(message: string, statusCode = 401) {
    super(message, statusCode);
  }
}
