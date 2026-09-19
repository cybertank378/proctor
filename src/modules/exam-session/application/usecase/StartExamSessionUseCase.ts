// Files: src/modules/exam-session/application/usecase/StartExamSessionUseCase.ts

import {BaseUseCase} from "@/core/application/base/BaseUseCase";
import type {AppResult} from "@/core/application/result/AppResult";
import {AppResultFactory} from "@/core/application/result/AppResultFactory";
import type {MoodleQuizAdapterContract} from "../../domain/contract/MoodleQuizAdapterContract";
import type {StartExamSessionRequestDto} from "../../domain/dto/ExamSessionRequestDto";
import type {StartExamSessionResultDto} from "../../domain/dto/ExamSessionResponseDto";
import {ExamSessionValidator} from "../../domain/validation/ExamSessionValidator";

export class StartExamSessionUseCase extends BaseUseCase<
  StartExamSessionRequestDto,
  StartExamSessionResultDto
> {
  constructor(private readonly moodleAdapter: MoodleQuizAdapterContract) {
    super();
  }

  public async execute(
    input: StartExamSessionRequestDto,
  ): Promise<AppResult<StartExamSessionResultDto>> {
    try {
      const safeQuizId = ExamSessionValidator.validateQuizId(input.quizId);

      const isValid =
        await this.moodleAdapter.validateQuizAvailability(safeQuizId);
      const embedUrl = this.moodleAdapter.getQuizEmbedUrl(safeQuizId);

      return AppResultFactory.success({
        isValid,
        quizId: safeQuizId,
        embedUrl,
      });
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Gagal menginisialisasi sesi ujian Moodle.";
      return AppResultFactory.failure(msg, 500);
    }
  }
}
