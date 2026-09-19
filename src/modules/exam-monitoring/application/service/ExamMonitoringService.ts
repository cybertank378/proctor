// src/modules/exam-monitoring/application/service/ExamMonitoringService.ts
import {BaseService} from "@/core/application/base/BaseService";
import {AppResult} from "@/core/application/result/AppResult";
import type {PaginatedResultContract} from "@/core/domain/contract/PaginatedResultContract";
import type {ProctorUserEntity} from "@/modules/auth/domain/entity/ProctorUserEntity";
import type {GetAttemptsFilterDto} from "../../domain/dto/MonitoringRequestDto";
import type {ActiveQuizResolutionDto, ExamAttemptSummaryDto} from "../../domain/dto/MonitoringResponseDto";
import type {GetActiveAttemptsUseCase} from "../usecase/GetActiveAttemptsUseCase";
import type {GetActiveQuizUseCase} from "../usecase/GetActiveQuizUseCase";

export class ExamMonitoringService extends BaseService {
    constructor(
        private readonly getActiveAttemptsUseCase: GetActiveAttemptsUseCase,
        private readonly getActiveQuizUseCase: GetActiveQuizUseCase
    ) {
        super();
    }

    public async getAttempts(
        filter: GetAttemptsFilterDto,
        proctor: ProctorUserEntity
    ): Promise<AppResult<PaginatedResultContract<ExamAttemptSummaryDto>>> {
        return this.getActiveAttemptsUseCase.execute({ filter, proctor });
    }

    public async getActiveQuiz(
        roomNumber: string | null | undefined,
        proctor: ProctorUserEntity
    ): Promise<AppResult<ActiveQuizResolutionDto>> {
        return this.getActiveQuizUseCase.execute({ roomNumber, proctor });
    }
}