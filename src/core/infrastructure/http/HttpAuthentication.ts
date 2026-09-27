//Files: src/core/infrastructure/http/HttpAuthentication.ts
import { UnauthorizedError } from "@/core/domain/error/UnauthorizedError";

export interface AuthenticatedProctorContext {
  readonly token: string;
}

export const HttpAuthentication = {
  extractBearerToken(headers: Headers): string {
    const authHeader = headers.get("authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      throw new UnauthorizedError(
        "Header otentikasi Bearer wajib disertakan dan harus valid.",
      );
    }

    const token = authHeader.substring(7).trim();

    if (!token) {
      throw new UnauthorizedError("Bearer token tidak boleh kosong.");
    }

    return token;
  },

  resolveContext(headers: Headers): AuthenticatedProctorContext {
    const token = HttpAuthentication.extractBearerToken(headers);
    return { token };
  },
};
