// Files: src/modules/exam-monitoring/application/usecase/UnlockExamAttemptUseCase.ts
import {BaseUseCase} from "@/core/application/base/BaseUseCase";
import type {AppResult} from "@/core/application/result/AppResult";
import {AppResultFactory} from "@/core/application/result/AppResultFactory";
import type {ProctorUserEntity} from "@/modules/auth/domain/entity/ProctorUserEntity";
import type {MoodleRpcClientContract} from "@/shared/contract/MoodleRpcClientContract";
import type {ExamMonitoringRepositoryContract} from "../../domain/contract/ExamMonitoringRepositoryContract";
import type {UnlockAttemptRequestDto} from "../../domain/dto/MonitoringRequestDto";
import type {UnlockAttemptResponseDto} from "../../domain/dto/MonitoringResponseDto";
import {ExamUnlockPolicy} from "../../domain/policy/ExamUnlockPolicy";
import {MonitoringValidator} from "../../domain/validation/MonitoringValidator";
import {MonitoringPresentationMapper} from "../../presentations/mapper/MonitoringPresentationMapper";

export interface UnlockAttemptContext {
  readonly dto: UnlockAttemptRequestDto;
  readonly proctor: ProctorUserEntity;
}

export class UnlockExamAttemptUseCase extends BaseUseCase<
  UnlockAttemptContext,
  UnlockAttemptResponseDto
> {
  constructor(
    private readonly repository: ExamMonitoringRepositoryContract,
    private readonly moodleRpcClient: MoodleRpcClientContract,
  ) {
    super();
  }

  public async execute(
    input: UnlockAttemptContext,
  ): Promise<AppResult<UnlockAttemptResponseDto>> {
    const { dto, proctor } = input;

    try {
      MonitoringValidator.validateAttemptId(dto.attemptId);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "ID attempt tidak valid.";
      return AppResultFactory.failure(msg, 400);
    }

    const attempt = await this.repository.findByAttemptId(dto.attemptId);
    if (!attempt) {
      return AppResultFactory.failure(
        "Sesi pengerjaan ujian siswa tidak ditemukan.",
        404,
      );
    }

    const isPermitted = ExamUnlockPolicy.canUnlock(
      proctor.role,
      proctor.roomNumber,
      attempt,
    );

    if (!isPermitted) {
      return AppResultFactory.failure(
        "Pengawas tidak memiliki wewenang atau status pengerjaan tidak dapat dibuka.",
        403,
      );
    }

    // 1. Jalankan sinkronisasi Moodle secara defensif (non-blocking)
    let rpcWarning: string | null = null;
    try {
      const rpcResult = await this.moodleRpcClient.unlockStudentAttempt({
        quizId: attempt.quizId,
        userId: attempt.userId,
        attemptId: attempt.attemptId,
        unlockedByProctorMoodleId: proctor.moodleUserId ?? 0,
      });

      if (!rpcResult.success) {
        rpcWarning = rpcResult.message ?? "Respon Moodle menolak otorisasi.";
        console.warn(`[MOODLE RPC WARNING] Sync RPC gagal: ${rpcWarning}`);
      }
    } catch (error: unknown) {
      rpcWarning =
        error instanceof Error
          ? error.message
          : "Gagal terhubung ke RPC Moodle.";
      console.error(
        "[MOODLE RPC ERROR] Exception pada sinkronisasi Moodle:",
        error,
      );
    }

    // 2. Buka kunci sesi siswa pada database lokal sistem proktor
    const updated = await this.repository.unlockAttempt(
      dto.attemptId,
      proctor.id,
    );

    const responseMessage = rpcWarning
      ? `Kunci attempt berhasil dibuka di sistem lokal (Peringatan Moodle: ${rpcWarning})`
      : "Kunci attempt pengerjaan ujian berhasil dibuka.";

    return AppResultFactory.success(
      MonitoringPresentationMapper.toUnlockDto(updated),
      responseMessage,
    );
  }
}
