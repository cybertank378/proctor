// src/modules/exam-monitoring/application/service/ExamMonitoringService.ts
import { BaseService } from "@/core/application/base/BaseService";
import type { AppResult } from "@/core/application/result/AppResult";
import type { PaginatedResultContract } from "@/core/domain/contract/PaginatedResultContract";
import type { ProctorUserEntity } from "@/modules/auth/domain/entity/ProctorUserEntity";
import type { GetAttemptsFilterDto } from "../../domain/dto/MonitoringRequestDto";
import type {
  ActiveQuizResolutionDto,
  ExamAttemptSummaryDto,
} from "../../domain/dto/MonitoringResponseDto";
import type { GetActiveAttemptsUseCase } from "../usecase/GetActiveAttemptsUseCase";
import type { GetActiveQuizUseCase } from "../usecase/GetActiveQuizUseCase";
import type { ListActiveQuizzesUseCase } from "../usecase/ListActiveQuizzesUseCase";

export class ExamMonitoringService extends BaseService {
  constructor(
    private readonly getActiveAttemptsUseCase: GetActiveAttemptsUseCase,
    private readonly getActiveQuizUseCase: GetActiveQuizUseCase,
    private readonly listActiveQuizzesUseCase: ListActiveQuizzesUseCase,
  ) {
    super();
  }

  public async getAttempts(
    filter: GetAttemptsFilterDto,
    proctor: ProctorUserEntity,
  ): Promise<AppResult<PaginatedResultContract<ExamAttemptSummaryDto>>> {
    return this.getActiveAttemptsUseCase.execute({ filter, proctor });
  }

  public async getActiveQuiz(
    roomNumber: string | null | undefined,
    proctor: ProctorUserEntity,
  ): Promise<AppResult<ActiveQuizResolutionDto | null>> {
    return this.getActiveQuizUseCase.execute({ roomNumber, proctor });
  }

  public async listActiveQuizzes(
    proctor: ProctorUserEntity,
  ): Promise<AppResult<readonly any[]>> {
    return this.listActiveQuizzesUseCase.execute({ proctor });
  }
}
