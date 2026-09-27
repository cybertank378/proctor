//Files: src/modules/auth/domain/validation/AuthValidator.ts
import { AuthError } from "./AuthError";

export const AuthValidator = {
  validateLogin(username: string, password: string): void {
    if (!username || !username.trim()) {
      throw new AuthError("Username pengawas wajib diisi.", 400);
    }
    if (!password || !password.trim()) {
      throw new AuthError("Kata sandi pengawas wajib diisi.", 400);
    }
  },

  validateToken(token: string): void {
    if (!token || !token.trim()) {
      throw new AuthError("Bearer token tidak boleh kosong.", 401);
    }
  },
};
