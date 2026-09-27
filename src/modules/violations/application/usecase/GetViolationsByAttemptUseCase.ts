//Files: src/modules/violations/application/usecase/GetViolationsByAttemptUseCase.ts
import { BaseUseCase } from "@/core/application/base/BaseUseCase";
import type { AppResult } from "@/core/application/result/AppResult";
import { AppResultFactory } from "@/core/application/result/AppResultFactory";
import type { ViolationRepositoryContract } from "../../domain/contract/ViolationRepositoryContract";
import type { ViolationSummaryDto } from "../../domain/dto/ViolationResponseDto";
import { ViolationValidator } from "../../domain/validation/ViolationValidator";
import { ViolationPresentationMapper } from "../../presentations/mapper/ViolationPresentationMapper";

export class GetViolationsByAttemptUseCase extends BaseUseCase<
  string,
  readonly ViolationSummaryDto[]
> {
  constructor(private readonly repository: ViolationRepositoryContract) {
    super();
  }

  public async execute(
    attemptRecordId: string,
  ): Promise<AppResult<readonly ViolationSummaryDto[]>> {
    try {
      ViolationValidator.validateAttemptRecordId(attemptRecordId);

      const records =
        await this.repository.findByAttemptRecordId(attemptRecordId);
      const dtos = records.map(ViolationPresentationMapper.toSummaryDto);

      return AppResultFactory.success(dtos);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Gagal mengambil daftar bukti pelanggaran.";
      return AppResultFactory.failure(msg, 400);
    }
  }
}
