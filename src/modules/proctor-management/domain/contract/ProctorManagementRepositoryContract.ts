//Files: src/modules/proctor-management/domain/contract/ProctorManagementRepositoryContract.ts
import type { ProctorRole } from "@/generated/prisma/enums";
import type { ProctorUserEntity } from "../entity/ProctorUserEntity";

export interface ProctorManagementRepositoryContract {
  findById(id: string): Promise<ProctorUserEntity | null>;
  findByUsername(username: string): Promise<ProctorUserEntity | null>;
  findByMoodleUserId(moodleUserId: number): Promise<ProctorUserEntity | null>;
  create(data: {
    username: string;
    passwordHash: string;
    fullName: string;
    role: ProctorRole;
    roomNumber: string | null;
    moodleUserId: number | null;
  }): Promise<ProctorUserEntity>;
  updateRoom(id: string, roomNumber: string | null): Promise<ProctorUserEntity>;
  list(roomNumber?: string): Promise<readonly ProctorUserEntity[]>;
}
