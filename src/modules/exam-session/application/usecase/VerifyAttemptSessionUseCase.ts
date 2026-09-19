// Files: src/modules/exam-session/application/usecase/VerifyAttemptSessionUseCase.ts

import {BaseUseCase} from "@/core/application/base/BaseUseCase";
import type {AppResult} from "@/core/application/result/AppResult";
import {AppResultFactory} from "@/core/application/result/AppResultFactory";
import type {ExamSessionRepositoryContract} from "../../domain/contract/ExamSessionRepositoryContract";
import type {MoodleQuizAdapterContract} from "../../domain/contract/MoodleQuizAdapterContract";
import type {VerifyAttemptRequestDto} from "../../domain/dto/ExamSessionRequestDto";
import type {ExamSessionStatusDto} from "../../domain/dto/ExamSessionResponseDto";
import {ExamSessionValidator} from "../../domain/validation/ExamSessionValidator";
import {ExamSessionPresentationMapper} from "../../presentations/mapper/ExamSessionPresentationMapper";

export class VerifyAttemptSessionUseCase extends BaseUseCase<
  VerifyAttemptRequestDto,
  ExamSessionStatusDto
> {
  constructor(
    private readonly repository: ExamSessionRepositoryContract,
    private readonly moodleAdapter: MoodleQuizAdapterContract,
  ) {
    super();
  }

  public async execute(
    input: VerifyAttemptRequestDto,
  ): Promise<AppResult<ExamSessionStatusDto>> {
    try {
      const safeQuizId = ExamSessionValidator.validateQuizId(input.quizId);
      const embedUrl = this.moodleAdapter.getQuizEmbedUrl(safeQuizId);

      const session = await this.repository.findSessionByAttempt(
        safeQuizId,
        input.attemptId,
      );

      if (!session) {
        return AppResultFactory.success({
          attemptId: input.attemptId ?? 0,
          quizId: safeQuizId,
          studentIdentifier: "Siswa",
          isLocked: false,
          violationCount: 0,
          maxAllowedViolations: 3,
          canResume: true,
          moodleEmbedUrl: embedUrl,
        });
      }

      return AppResultFactory.success(
        ExamSessionPresentationMapper.toDto(session, embedUrl),
      );
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Gagal memverifikasi status sesi pengerjaan ujian.";
      return AppResultFactory.failure(msg, 500);
    }
  }
}
