//Files: src/modules/auth/application/usecase/GetCurrentSessionUseCase.ts
import { BaseUseCase } from "@/core/application/base/BaseUseCase";
import type { AppResult } from "@/core/application/result/AppResult";
import { AppResultFactory } from "@/core/application/result/AppResultFactory";
import type { AuthRepositoryContract } from "../../domain/contract/AuthRepositoryContract";
import type { AuthTokenProviderContract } from "../../domain/contract/AuthTokenProviderContract";
import type { CurrentSessionResponseDto } from "../../domain/dto/AuthResponseDto";
import { AuthPolicy } from "../../domain/policy/AuthPolicy";
import { AuthValidator } from "../../domain/validation/AuthValidator";
import { AuthPresentationMapper } from "../../presentations/mapper/AuthPresentationMapper";

export class GetCurrentSessionUseCase extends BaseUseCase<
  string,
  CurrentSessionResponseDto
> {
  constructor(
    private readonly authRepo: AuthRepositoryContract,
    private readonly tokenProvider: AuthTokenProviderContract,
  ) {
    super();
  }

  public async execute(
    token: string,
  ): Promise<AppResult<CurrentSessionResponseDto>> {
    try {
      AuthValidator.validateToken(token);
      const decoded = await this.tokenProvider.verifyToken(token);

      const session = await this.authRepo.findSessionByToken(token);
      if (!session || session.isExpired()) {
        return AppResultFactory.failure(
          "Sesi telah kedaluwarsa atau tidak ditemukan.",
          401,
        );
      }

      const proctor = await this.authRepo.findById(decoded.proctorId);
      if (!AuthPolicy.canAuthenticate(proctor)) {
        return AppResultFactory.failure(
          "Akun pengawas dinonaktifkan atau dibatasi.",
          401,
        );
      }

      return AppResultFactory.success(
        AuthPresentationMapper.toCurrentSession(proctor!),
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Sesi tidak valid.";
      return AppResultFactory.failure(msg, 401);
    }
  }
}
