// Files: src/modules/exam-session/application/usecase/UnlockAttemptWithPinUseCase.ts
import { BaseUseCase } from "@/core/application/base/BaseUseCase";
import type { AppResult } from "@/core/application/result/AppResult";
import { AppResultFactory } from "@/core/application/result/AppResultFactory";
import { PinGenerator } from "@/shared/helpers/PinGenerator";
import type { MoodleRpcClientContract } from "@/shared/contract/MoodleRpcClientContract";
import type { ExamSessionRepositoryContract } from "../../domain/contract/ExamSessionRepositoryContract";

export interface UnlockAttemptWithPinDto {
  readonly attemptId?: number;
  readonly pin?: string;
}

export class UnlockAttemptWithPinUseCase extends BaseUseCase<
  UnlockAttemptWithPinDto,
  { readonly attemptId: number; readonly isUnlocked: boolean }
> {
  constructor(
    private readonly repository: ExamSessionRepositoryContract,
    private readonly moodleRpcClient: MoodleRpcClientContract,
  ) {
    super();
  }

  public async execute(
    input: UnlockAttemptWithPinDto,
  ): Promise<
    AppResult<{ readonly attemptId: number; readonly isUnlocked: boolean }>
  > {
    const attemptId = Number(input?.attemptId);
    const pin = String(input?.pin || "").trim();

    if (!attemptId || Number.isNaN(attemptId) || pin.length === 0) {
      return AppResultFactory.failure(
        "Parameter 'attemptId' dan 'pin' wajib diisi dengan benar.",
        400,
      );
    }

    const session = await this.repository.findByAttemptId(attemptId);
    if (!session) {
      return AppResultFactory.failure(
        `Sesi pengerjaan attempt #${attemptId} tidak ditemukan.`,
        404,
      );
    }

    const expectedPin = PinGenerator.generateForAttempt(
      session.attemptId,
      session.quizId,
    );

    console.info(
      `[UNLOCK WITH PIN USECASE] Attempt: #${attemptId}, Input: "${pin}", Expected: "${expectedPin}"`,
    );

    if (pin !== expectedPin) {
      return AppResultFactory.failure("PIN buka kunci tidak valid.", 403);
    }

    // 1. Jalankan sinkronisasi Moodle secara defensif (non-blocking)
    try {
      const rpcResult = await this.moodleRpcClient.unlockStudentAttempt({
        quizId: session.quizId,
        userId: Number(session.studentIdentifier) || 0,
        attemptId: session.attemptId,
        unlockedByProctorMoodleId: 0,
      });

      if (!rpcResult.success) {
        console.warn(
          `[UNLOCK WITH PIN] Peringatan Moodle RPC (dilewati): ${rpcResult.message}`,
        );
      }
    } catch (error: unknown) {
      console.warn("[UNLOCK WITH PIN] Exception pada Moodle RPC:", error);
    }

    // 2. Buka kunci di database lokal dan reset violationCount
    const success = await this.repository.unlockAttempt(attemptId);
    if (!success) {
      return AppResultFactory.failure(
        "Gagal memperbarui status buka kunci di database.",
        500,
      );
    }

    return AppResultFactory.success(
      { attemptId, isUnlocked: true },
      "Kunci ujian berhasil dibuka dengan PIN.",
      200,
    );
  }
}
