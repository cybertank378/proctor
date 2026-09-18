//Files: src/modules/exam-monitoring/application/service/ExamMonitoringService.ts
import {BaseService} from "@/core/application/base/BaseService";
import {AppResult} from "@/core/application/result/AppResult";
import type {PaginatedResultContract} from "@/core/domain/contract/PaginatedResultContract";
import type {ProctorUserEntity} from "@/modules/auth/domain/entity/ProctorUserEntity";
import type {GetAttemptsFilterDto} from "../../domain/dto/MonitoringRequestDto";
import type {ExamAttemptSummaryDto} from "../../domain/dto/MonitoringResponseDto";
import type {GetActiveAttemptsUseCase} from "../usecase/GetActiveAttemptsUseCase";

export class ExamMonitoringService extends BaseService {
    constructor(private readonly getActiveAttemptsUseCase: GetActiveAttemptsUseCase) {
        super();
    }

    public async getAttempts(
        filter: GetAttemptsFilterDto,
        proctor: ProctorUserEntity
    ): Promise<AppResult<PaginatedResultContract<ExamAttemptSummaryDto>>> {
        return this.getActiveAttemptsUseCase.execute({ filter, proctor });
    }
}