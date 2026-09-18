//Files: src/shared/helpers/RoomScopeHelper.ts
import type {ProctorRole} from "@/modules/auth/domain/entity/ProctorUserEntity";

export class RoomScopeHelper {
    public static canManageTargetRoom(
        proctorRole: ProctorRole,
        assignedRoom: string | null,
        targetRoom: string | null
    ): boolean {
        if (proctorRole === "CHIEF_PROCTOR") {
            return true;
        }

        if (!assignedRoom || !targetRoom) {
            return false;
        }

        const normalizedAssigned = assignedRoom.trim().toLowerCase();
        const normalizedTarget = targetRoom.trim().toLowerCase();

        if (!normalizedAssigned || !normalizedTarget) {
            return false;
        }

        return normalizedAssigned === normalizedTarget;
    }

    public static resolveFilterRoom(
        proctorRole: ProctorRole,
        assignedRoom: string | null,
        requestedRoom?: string | null
    ): string | null {
        if (proctorRole === "CHIEF_PROCTOR") {
            return requestedRoom && requestedRoom.trim() ? requestedRoom.trim() : null;
        }
        return assignedRoom && assignedRoom.trim() ? assignedRoom.trim() : null;
    }
}