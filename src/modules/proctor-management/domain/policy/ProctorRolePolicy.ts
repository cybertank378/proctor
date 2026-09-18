//Files: src/modules/proctor-management/domain/policy/ProctorRolePolicy.ts
import type {ProctorRole} from "@/generated/prisma/enums";

export const ProctorRolePolicy = {
    sanitizeRoomNumber(role: ProctorRole, roomNumber?: string): string | null {
        if (role === "CHIEF_PROCTOR") {
            return null;
        }
        return roomNumber?.trim() || null;
    }
}