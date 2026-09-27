// Files: src/modules/exam-monitoring/application/usecase/GetActiveAttemptsUseCase.ts

import { BaseUseCase } from "@/core/application/base/BaseUseCase";
import type { AppResult } from "@/core/application/result/AppResult";
import { AppResultFactory } from "@/core/application/result/AppResultFactory";
import type { PaginatedResultContract } from "@/core/domain/contract/PaginatedResultContract";
import type { ProctorUserEntity } from "@/modules/auth/domain/entity/ProctorUserEntity";
import type { MoodleRpcClientContract } from "@/shared/contract/MoodleRpcClientContract";
import { RoomScopeHelper } from "@/shared/helpers/RoomScopeHelper";
import type { ExamMonitoringRepositoryContract } from "../../domain/contract/ExamMonitoringRepositoryContract";
import type { GetAttemptsFilterDto } from "../../domain/dto/MonitoringRequestDto";
import type { ExamAttemptSummaryDto } from "../../domain/dto/MonitoringResponseDto";
import { MonitoringValidator } from "../../domain/validation/MonitoringValidator";
import { MonitoringPresentationMapper } from "../../presentations/mapper/MonitoringPresentationMapper";

export interface GetAttemptsContext {
  readonly filter: GetAttemptsFilterDto;
  readonly proctor: ProctorUserEntity;
}

export class GetActiveAttemptsUseCase extends BaseUseCase<
  GetAttemptsContext,
  PaginatedResultContract<ExamAttemptSummaryDto>
> {
  constructor(
    private readonly repository: ExamMonitoringRepositoryContract,
    private readonly moodleRpcClient: MoodleRpcClientContract,
  ) {
    super();
  }

  public async execute(
    input: GetAttemptsContext,
  ): Promise<AppResult<PaginatedResultContract<ExamAttemptSummaryDto>>> {
    const page = input.filter.page ?? 1;
    const pageSize = input.filter.pageSize ?? 10;

    try {
      MonitoringValidator.validatePagination(page, pageSize);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Parameter paginasi tidak valid.";
      return AppResultFactory.failure(msg, 400);
    }

    const roomNumber = RoomScopeHelper.resolveFilterRoom(
      input.proctor.role,
      input.proctor.roomNumber,
      input.filter.roomNumber,
    );

    if (input.filter.quizId && input.filter.quizId > 0) {
      try {
        const liveMoodleAttempts = await this.moodleRpcClient.getActiveAttempts(
          input.filter.quizId,
        );

        if (liveMoodleAttempts.length > 0) {
          await this.repository.syncMoodleAttempts(liveMoodleAttempts);
        }
      } catch (err) {
        console.warn("[RPC MOODLE WARN] Gagal sinkronisasi siswa aktif:", err);
      }
    }

    const skip = (page - 1) * pageSize;
    const { items, total } = await this.repository.findActiveAttempts({
      quizId: input.filter.quizId,
      roomNumber,
      status: input.filter.status,
      skip,
      take: pageSize,
    });

    const totalPages = Math.ceil(total / pageSize) || 1;

    return AppResultFactory.success({
      items: items.map(MonitoringPresentationMapper.toSummaryDto),
      meta: {
        page,
        pageSize,
        totalItems: total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  }
}
