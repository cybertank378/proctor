//Files: src/modules/proctor-management/application/usecase/CreateProctorUseCase.ts

import type { AppResult } from "@/core/application/result/AppResult";
import { AppResultFactory } from "@/core/application/result/AppResultFactory";
import type { Argon2PasswordHasher } from "@/modules/auth/infrastructure/security/Argon2PasswordHasher";
import type { ProctorManagementRepositoryContract } from "../../domain/contract/ProctorManagementRepositoryContract";
import type { CreateProctorRequestDto } from "../../domain/dto/ProctorManagementRequestDto";
import type { ProctorSummaryResponseDto } from "../../domain/dto/ProctorManagementResponseDto";
import { ProctorRolePolicy } from "../../domain/policy/ProctorRolePolicy";
import { ProctorValidator } from "../../domain/validation/ProctorValidator";

export class CreateProctorUseCase {
  constructor(
    private readonly repository: ProctorManagementRepositoryContract,
    private readonly passwordHasher: Argon2PasswordHasher,
  ) {}

  public async execute(
    dto: CreateProctorRequestDto,
  ): Promise<AppResult<ProctorSummaryResponseDto>> {
    const validationError = ProctorValidator.validateCreate(dto);
    if (validationError) {
      return AppResultFactory.failure(validationError, 400);
    }

    const existing = await this.repository.findByUsername(dto.username.trim());
    if (existing) {
      return AppResultFactory.failure(
        "Username pengawas sudah digunakan.",
        400,
      );
    }

    const passwordHash = await this.passwordHasher.hash(dto.password);
    const role = dto.role ?? "PROCTOR";
    const roomNumber = ProctorRolePolicy.sanitizeRoomNumber(
      role,
      dto.roomNumber,
    );

    const entity = await this.repository.create({
      username: dto.username.trim(),
      passwordHash,
      fullName: dto.fullName.trim(),
      role,
      roomNumber,
      moodleUserId: dto.moodleUserId ?? null,
    });

    return AppResultFactory.success(
      {
        id: entity.id,
        username: entity.username,
        fullName: entity.fullName,
        role: entity.role,
        roomNumber: entity.roomNumber,
        isActive: entity.isActive,
        moodleUserId: entity.moodleUserId,
        createdAt: entity.createdAt.toISOString(),
        updatedAt: entity.updatedAt.toISOString(),
      },
      "Akun pengawas berhasil dibuat.",
      201,
    );
  }
}
