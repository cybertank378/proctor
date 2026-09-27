//Files: src/modules/auth/infrastructure/security/BearerTokenProvider.ts
import { errors, jwtVerify, SignJWT } from "jose";
import type {
  AuthTokenProviderContract,
  ProctorTokenPayload,
} from "../../domain/contract/AuthTokenProviderContract";

export class BearerTokenProvider implements AuthTokenProviderContract {
  private readonly encodedKey: Uint8Array;

  constructor(secretKey: string = process.env.JWT_SECRET || "") {
    if (!secretKey || secretKey.length < 32) {
      throw new Error("JWT Secret key minimal harus memiliki 32 karakter.");
    }
    this.encodedKey = new TextEncoder().encode(secretKey);
  }

  public async generateToken(
    payload: ProctorTokenPayload,
    expiresIn = "8h",
  ): Promise<string> {
    return new SignJWT({
      username: payload.username,
      role: payload.role,
      roomNumber: payload.roomNumber,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setSubject(payload.proctorId)
      .setIssuedAt()
      .setExpirationTime(expiresIn)
      .sign(this.encodedKey);
  }

  public async verifyToken(token: string): Promise<ProctorTokenPayload> {
    if (!token || !token.trim()) {
      throw new Error("Token tidak boleh kosong.");
    }

    try {
      const { payload } = await jwtVerify(token, this.encodedKey, {
        algorithms: ["HS256"],
      });

      if (!payload.sub) {
        throw new Error("Klaim sub tidak ditemukan dalam token.");
      }

      return {
        proctorId: payload.sub,
        username: typeof payload.username === "string" ? payload.username : "",
        role: payload.role as ProctorTokenPayload["role"],
        roomNumber:
          typeof payload.roomNumber === "string" ? payload.roomNumber : null,
      };
    } catch (err: unknown) {
      if (err instanceof errors.JWTExpired) {
        throw new Error("Token telah kedaluwarsa.");
      }
      if (
        err instanceof errors.JWSSignatureVerificationFailed ||
        err instanceof errors.JWSInvalid
      ) {
        throw new Error("Token tidak valid atau signature salah.");
      }
      throw new Error(
        err instanceof Error ? err.message : "Verifikasi token gagal.",
      );
    }
  }
}
