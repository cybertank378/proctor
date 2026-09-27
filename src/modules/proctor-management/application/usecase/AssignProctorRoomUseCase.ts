//Files: src/modules/proctor-management/application/usecase/AssignProctorRoomUseCase.ts

import type { AppResult } from "@/core/application/result/AppResult";
import { AppResultFactory } from "@/core/application/result/AppResultFactory";
import type { ProctorManagementRepositoryContract } from "../../domain/contract/ProctorManagementRepositoryContract";
import type { AssignProctorRoomRequestDto } from "../../domain/dto/ProctorManagementRequestDto";
import type { ProctorSummaryResponseDto } from "../../domain/dto/ProctorManagementResponseDto";
import { ProctorValidator } from "../../domain/validation/ProctorValidator";

export class AssignProctorRoomUseCase {
  constructor(
    private readonly repository: ProctorManagementRepositoryContract,
  ) {}

  public async execute(
    dto: AssignProctorRoomRequestDto,
  ): Promise<AppResult<ProctorSummaryResponseDto>> {
    const validationError = ProctorValidator.validateAssign(dto);
    if (validationError) {
      return AppResultFactory.failure(validationError, 400);
    }

    const proctor = await this.repository.findById(dto.proctorId);
    if (!proctor) {
      return AppResultFactory.failure("Akun pengawas tidak ditemukan.", 404);
    }

    const updated = await this.repository.updateRoom(
      dto.proctorId,
      dto.roomNumber.trim(),
    );

    return AppResultFactory.success(
      {
        id: updated.id,
        username: updated.username,
        fullName: updated.fullName,
        role: updated.role,
        roomNumber: updated.roomNumber,
        isActive: updated.isActive,
        moodleUserId: updated.moodleUserId,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
      },
      "Ruangan pengawas berhasil dialokasikan.",
    );
  }
}
