// Files: src/modules/exam-session/application/usecase/RecordViolationUseCase.ts

import { BaseUseCase } from "@/core/application/base/BaseUseCase";
import type { AppResult } from "@/core/application/result/AppResult";
import { AppResultFactory } from "@/core/application/result/AppResultFactory";
import type { ExamSessionRepositoryContract } from "../../domain/contract/ExamSessionRepositoryContract";
import type { RecordViolationRequestDto } from "../../domain/dto/ExamSessionRequestDto";
import type { RecordViolationResultDto } from "../../domain/dto/ExamSessionResponseDto";
import { ExamSessionValidator } from "../../domain/validation/ExamSessionValidator";

export class RecordViolationUseCase extends BaseUseCase<
  RecordViolationRequestDto,
  RecordViolationResultDto
> {
  constructor(private readonly repository: ExamSessionRepositoryContract) {
    super();
  }

  public async execute(
    input: RecordViolationRequestDto,
  ): Promise<AppResult<RecordViolationResultDto>> {
    try {
      ExamSessionValidator.validateViolationPayload(input);

      const result = await this.repository.saveViolationRecord(input);

      const message = result.isLocked
        ? "Batas toleransi pelanggaran terlampaui. Ujian terkunci otomatis."
        : "Bukti insiden kecurangan berhasil diaudit dan dicatat.";

      return AppResultFactory.success(result, message, 201);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Gagal mencatat log audit pelanggaran ujian.";
      return AppResultFactory.failure(msg, 400);
    }
  }
}
