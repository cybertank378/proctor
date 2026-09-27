// src/modules/exam-monitoring/application/usecase/ListActiveQuizzesUseCase.ts
import { BaseUseCase } from "@/core/application/base/BaseUseCase";
import type { AppResult } from "@/core/application/result/AppResult";
import { AppResultFactory } from "@/core/application/result/AppResultFactory";
import type { ProctorUserEntity } from "@/modules/auth/domain/entity/ProctorUserEntity";
import type { MoodleRpcClientContract } from "@/shared/contract/MoodleRpcClientContract";

export interface ListActiveQuizzesContext {
  readonly proctor: ProctorUserEntity;
}

export class ListActiveQuizzesUseCase extends BaseUseCase<
  ListActiveQuizzesContext,
  readonly any[]
> {
  constructor(private readonly moodleRpcClient: MoodleRpcClientContract) {
    super();
  }

  public async execute(
    input: ListActiveQuizzesContext,
  ): Promise<AppResult<readonly any[]>> {
    if (!input.proctor || !input.proctor.isActive) {
      return AppResultFactory.failure(
        "Akses ditolak: Pengawas tidak valid.",
        401,
      );
    }

    const quizzes = await this.moodleRpcClient.getActiveQuizzes();
    return AppResultFactory.success(quizzes);
  }
}
