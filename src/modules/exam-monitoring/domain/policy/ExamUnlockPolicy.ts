//Files: src/modules/exam-monitoring/domain/policy/ExamUnlockPolicy.ts
import type {ProctorRole} from "@/modules/auth/domain/entity/ProctorUserEntity";
import {RoomScopeHelper} from "@/shared/helpers/RoomScopeHelper";
import type {ExamAttemptEntity} from "../entity/ExamAttemptEntity";

export const ExamUnlockPolicy = {
  canUnlock(
    proctorRole: ProctorRole,
    proctorRoomNumber: string | null,
    attempt: ExamAttemptEntity,
  ): boolean {
    if (!attempt.canBeUnlocked()) {
      return false;
    }

    return RoomScopeHelper.canManageTargetRoom(
      proctorRole,
      proctorRoomNumber,
      attempt.roomNumber,
    );
  },
};
