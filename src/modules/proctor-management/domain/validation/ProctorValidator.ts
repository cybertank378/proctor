//Files: src/modules/proctor-management/domain/validation/ProctorValidator.ts
import type {
  AssignProctorRoomRequestDto,
  CreateProctorRequestDto,
} from "../dto/ProctorManagementRequestDto";

export const ProctorValidator = {
  validateCreate(dto: CreateProctorRequestDto): string | null {
    if (!dto.username || dto.username.trim().length < 3) {
      return "Username minimal harus 3 karakter.";
    }
    if (!dto.password || dto.password.length < 6) {
      return "Kata sandi minimal harus 6 karakter.";
    }
    if (!dto.fullName || dto.fullName.trim().length === 0) {
      return "Nama lengkap wajib diisi.";
    }
    return null;
  },

  validateAssign(dto: AssignProctorRoomRequestDto): string | null {
    if (!dto.proctorId || dto.proctorId.trim().length === 0) {
      return "ID Pengawas wajib disertakan.";
    }
    if (!dto.roomNumber || dto.roomNumber.trim().length === 0) {
      return "Nama ruangan pengawasan wajib diisi.";
    }
    return null;
  },
};
