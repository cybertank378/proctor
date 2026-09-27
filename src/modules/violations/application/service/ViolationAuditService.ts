//Files: src/modules/violations/application/service/ViolationAuditService.ts
import { BaseService } from "@/core/application/base/BaseService";
import type { AppResult } from "@/core/application/result/AppResult";
import type {
  RecordViolationRequestDto,
  VerifyEvidenceIntegrityRequestDto,
} from "../../domain/dto/ViolationRequestDto";
import type {
  VerifyIntegrityResultDto,
  ViolationSummaryDto,
} from "../../domain/dto/ViolationResponseDto";
import type { GetViolationsByAttemptUseCase } from "../usecase/GetViolationsByAttemptUseCase";
import type {
  RecordViolationResultDto,
  RecordViolationUseCase,
} from "../usecase/RecordViolationUseCase";
import type { VerifyEvidenceIntegrityUseCase } from "../usecase/VerifyEvidenceIntegrityUseCase";

export class ViolationAuditService extends BaseService {
  constructor(
    private readonly recordUseCase: RecordViolationUseCase,
    private readonly getByAttemptUseCase: GetViolationsByAttemptUseCase,
    private readonly verifyIntegrityUseCase: VerifyEvidenceIntegrityUseCase,
  ) {
    super();
  }

  public async recordIncident(
    dto: RecordViolationRequestDto,
  ): Promise<AppResult<RecordViolationResultDto>> {
    return this.recordUseCase.execute(dto);
  }

  public async getHistory(
    attemptRecordId: string,
  ): Promise<AppResult<readonly ViolationSummaryDto[]>> {
    return this.getByAttemptUseCase.execute(attemptRecordId);
  }

  public async verifyIntegrity(
    dto: VerifyEvidenceIntegrityRequestDto,
  ): Promise<AppResult<VerifyIntegrityResultDto>> {
    return this.verifyIntegrityUseCase.execute(dto);
  }
}
