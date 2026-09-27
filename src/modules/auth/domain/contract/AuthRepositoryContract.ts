//Files: src/modules/auth/domain/contract/AuthRepositoryContract.ts
import type { ProctorSessionEntity } from "../entity/ProctorSessionEntity";
import type { ProctorUserEntity } from "../entity/ProctorUserEntity";

export interface AuthRepositoryContract {
  findByUsername(username: string): Promise<ProctorUserEntity | null>;
  findById(id: string): Promise<ProctorUserEntity | null>;
  findSessionByToken(token: string): Promise<ProctorSessionEntity | null>;
  createSession(
    proctorId: string,
    token: string,
    expiresAt: Date,
  ): Promise<void>;
  deleteSession(token: string): Promise<void>;
}
