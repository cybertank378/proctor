//Files: src/modules/auth/domain/contract/AuthTokenProviderContract.ts
import type { ProctorRole } from "../entity/ProctorUserEntity";

export interface ProctorTokenPayload {
  readonly proctorId: string;
  readonly username: string;
  readonly role: ProctorRole;
  readonly roomNumber: string | null;
}

export interface AuthTokenProviderContract {
  generateToken(
    payload: ProctorTokenPayload,
    expiresIn?: string,
  ): Promise<string>;
  verifyToken(token: string): Promise<ProctorTokenPayload>;
}
