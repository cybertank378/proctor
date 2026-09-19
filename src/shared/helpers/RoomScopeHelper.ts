// Files: src/shared/helpers/RoomScopeHelper.ts
export class RoomScopeHelper {
  public static resolveFilterRoom(
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
  }
}
