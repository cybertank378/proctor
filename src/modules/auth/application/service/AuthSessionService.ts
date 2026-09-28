//Files: src/modules/auth/application/service/AuthSessionService.ts
import { BaseService } from "@/core/application/base/BaseService";
import type { AppResult } from "@/core/application/result/AppResult";
import type { CurrentSessionResponseDto } from "../../domain/dto/AuthResponseDto";
import type { GetCurrentSessionUseCase } from "../usecase/GetCurrentSessionUseCase";

export class AuthSessionService extends BaseService {
  constructor(private readonly getSessionUseCase: GetCurrentSessionUseCase) {
    super();
  }

  public async resolveSession(
    token: string,
  ): Promise<AppResult<CurrentSessionResponseDto>> {
    return this.getSessionUseCase.execute(token);
  }
}
