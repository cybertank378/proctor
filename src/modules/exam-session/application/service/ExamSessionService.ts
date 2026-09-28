// Files: src/modules/exam-session/application/service/ExamSessionService.ts
import type { AppResult } from "@/core/application/result/AppResult";
import type {
  LockAttemptRequestDto,
  RecordViolationRequestDto,
  VerifyAttemptRequestDto,
} from "../../domain/dto/ExamSessionRequestDto";
import type {
  ExamSessionStatusDto,
  RecordViolationResultDto,
} from "../../domain/dto/ExamSessionResponseDto";
import type { LockAttemptSessionUseCase } from "../usecase/LockAttemptSessionUseCase";
import type { RecordViolationUseCase } from "../usecase/RecordViolationUseCase";
import type { UnlockAttemptWithPinUseCase } from "../usecase/UnlockAttemptWithPinUseCase";
import type { VerifyAttemptSessionUseCase } from "../usecase/VerifyAttemptSessionUseCase";

export class ExamSessionService {
  constructor(
    private readonly verifyAttemptSessionUseCase: VerifyAttemptSessionUseCase,
    private readonly recordViolationUseCase: RecordViolationUseCase,
    private readonly lockAttemptSessionUseCase: LockAttemptSessionUseCase,
    private readonly unlockAttemptWithPinUseCase: UnlockAttemptWithPinUseCase,
  ) {}

  public async verifySession(
    dto: VerifyAttemptRequestDto,
  ): Promise<AppResult<ExamSessionStatusDto>> {
    return this.verifyAttemptSessionUseCase.execute(dto);
  }

  public async recordViolation(
    dto: RecordViolationRequestDto,
  ): Promise<AppResult<RecordViolationResultDto>> {
    return this.recordViolationUseCase.execute(dto);
  }

  public async lockSession(
    dto: LockAttemptRequestDto,
  ): Promise<AppResult<boolean>> {
    return this.lockAttemptSessionUseCase.execute(dto);
  }

  public async unlockWithPin(dto: {
    attemptId?: number;
    pin?: string;
  }): Promise<
    AppResult<{ readonly attemptId: number; readonly isUnlocked: boolean }>
  > {
    return this.unlockAttemptWithPinUseCase.execute(dto);
  }
}
