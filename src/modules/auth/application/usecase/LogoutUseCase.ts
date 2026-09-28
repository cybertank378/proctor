//Files: src/modules/auth/application/usecase/LogoutUseCase.ts
import { BaseUseCase } from "@/core/application/base/BaseUseCase";
import type { AppResult } from "@/core/application/result/AppResult";
import { AppResultFactory } from "@/core/application/result/AppResultFactory";
import type { AuthRepositoryContract } from "../../domain/contract/AuthRepositoryContract";
import { AuthValidator } from "../../domain/validation/AuthValidator";

export class LogoutUseCase extends BaseUseCase<string, void> {
  constructor(private readonly authRepo: AuthRepositoryContract) {
    super();
  }

  public async execute(token: string): Promise<AppResult<void>> {
    try {
      AuthValidator.validateToken(token);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Token tidak valid.";
      return AppResultFactory.failure(msg, 400);
    }

    await this.authRepo.deleteSession(token);
    return AppResultFactory.success(undefined, "Sesi berhasil diakhiri.");
  }
}
