// Files: src/modules/exam-session/application/service/ExamSessionService.ts

import {BaseService} from "@/core/application/base/BaseService";
import type {AppResult} from "@/core/application/result/AppResult";
import type {
    LockAttemptRequestDto,
    RecordViolationRequestDto,
    StartExamSessionRequestDto,
    VerifyAttemptRequestDto,
} from "../../domain/dto/ExamSessionRequestDto";
import type {
    ExamSessionStatusDto,
    RecordViolationResultDto,
    StartExamSessionResultDto,
} from "../../domain/dto/ExamSessionResponseDto";
import type {LockAttemptSessionUseCase} from "../usecase/LockAttemptSessionUseCase";
import type {RecordViolationUseCase} from "../usecase/RecordViolationUseCase";
import type {StartExamSessionUseCase} from "../usecase/StartExamSessionUseCase";
import type {VerifyAttemptSessionUseCase} from "../usecase/VerifyAttemptSessionUseCase";

export class ExamSessionService extends BaseService {
  constructor(
    private readonly recordViolationUseCase: RecordViolationUseCase,
    private readonly verifyAttemptUseCase: VerifyAttemptSessionUseCase,
    private readonly lockAttemptUseCase: LockAttemptSessionUseCase,
    private readonly startSessionUseCase: StartExamSessionUseCase,
  ) {
    super();
  }

  public async recordViolation(
    dto: RecordViolationRequestDto,
  ): Promise<AppResult<RecordViolationResultDto>> {
    return this.recordViolationUseCase.execute(dto);
  }

  public async verifySession(
    dto: VerifyAttemptRequestDto,
  ): Promise<AppResult<ExamSessionStatusDto>> {
    return this.verifyAttemptUseCase.execute(dto);
  }

  public async lockSession(
    dto: LockAttemptRequestDto,
  ): Promise<AppResult<boolean>> {
    return this.lockAttemptUseCase.execute(dto);
  }

  public async startSession(
    dto: StartExamSessionRequestDto,
  ): Promise<AppResult<StartExamSessionResultDto>> {
    return this.startSessionUseCase.execute(dto);
  }
}
