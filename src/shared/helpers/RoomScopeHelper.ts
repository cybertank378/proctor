// Files: src/shared/helpers/RoomScopeHelper.ts

import type { ProctorRole } from "@/generated/prisma/enums";

export const RoomScopeHelper = {
  resolveFilterRoom(
    role: string,
    proctorRoom?: string | null,
    inputRoom?: string | null,
  ): string | null {
    // 1. Jika Ketua Pengawas dan ada input ruangan spesifik, gunakan input tersebut
    if (role === "CHIEF_PROCTOR") {
      return inputRoom && inputRoom.trim().length > 0 ? inputRoom.trim() : null;
    }

    // 2. Jika pengawas reguler, wajib terkunci pada ruangannya sendiri
    return proctorRoom && proctorRoom.trim().length > 0
      ? proctorRoom.trim()
      : null;
  },
  canManageTargetRoom(
    proctorRole: ProctorRole,
    assignedRoom: string | null,
    targetRoom: string | null,
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
  },
};
