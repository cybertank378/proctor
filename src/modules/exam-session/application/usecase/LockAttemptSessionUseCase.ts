// Files: src/modules/exam-session/application/usecase/LockAttemptSessionUseCase.ts

import {BaseUseCase} from "@/core/application/base/BaseUseCase";
import type {AppResult} from "@/core/application/result/AppResult";
import {AppResultFactory} from "@/core/application/result/AppResultFactory";
import type {ExamSessionRepositoryContract} from "../../domain/contract/ExamSessionRepositoryContract";
import type {LockAttemptRequestDto} from "../../domain/dto/ExamSessionRequestDto";
import {ExamSessionValidator} from "../../domain/validation/ExamSessionValidator";

export class LockAttemptSessionUseCase extends BaseUseCase<
  LockAttemptRequestDto,
  boolean
> {
  constructor(private readonly repository: ExamSessionRepositoryContract) {
    super();
  }

  public async execute(
    input: LockAttemptRequestDto,
  ): Promise<AppResult<boolean>> {
    try {
      const safeAttemptId = ExamSessionValidator.validateAttemptId(
        input.attemptId,
      );

      const isLocked = await this.repository.lockAttempt(
        safeAttemptId,
        input.reason,
      );

      if (!isLocked) {
        return AppResultFactory.failure(
          "Sesi pengerjaan gagal dikunci pada server monitoring.",
          500,
        );
      }

      return AppResultFactory.success(
        true,
        "Sesi ujian siswa berhasil dikunci.",
      );
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat mengunci sesi pengerjaan ujian.";
      return AppResultFactory.failure(msg, 500);
    }
  }
}
