// Files: src/modules/exam-session/infrastructure/repository/PrismaExamSessionRepository.ts

import crypto from "node:crypto";
import {AttemptStatus, ViolationType} from "@/generated/prisma/enums";
import prisma from "@/lib/prisma";
import type {ExamSessionRepositoryContract} from "../../domain/contract/ExamSessionRepositoryContract";
import type {RecordViolationRequestDto} from "../../domain/dto/ExamSessionRequestDto";
import type {RecordViolationResultDto} from "../../domain/dto/ExamSessionResponseDto";
import {ExamSessionEntity} from "../../domain/entity/ExamSessionEntity";
import {ExamSessionQueryBuilder} from "../builder/ExamSessionQueryBuilder";

export class PrismaExamSessionRepository
  implements ExamSessionRepositoryContract
{
  public async findSessionByAttempt(
    quizId: number,
    attemptId?: number,
  ): Promise<ExamSessionEntity | null> {
    const where = ExamSessionQueryBuilder.byAttempt(quizId, attemptId);

    const record = await prisma.examAttemptRecord.findFirst({
      where,
      orderBy: { updatedAt: "desc" },
    });

    if (!record) return null;

    const isLocked =
      record.isLockedByProctor || record.status === AttemptStatus.LOCKED;

    return new ExamSessionEntity({
      id: record.id,
      attemptId: record.attemptId,
      quizId: record.quizId,
      studentIdentifier: String(record.userId),
      violationCount: record.violationCount,
      maxAllowedViolations: record.maxAllowedViolations,
      isLocked,
      status: isLocked ? "LOCKED" : "IN_PROGRESS",
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }

  public async saveViolationRecord(
    dto: RecordViolationRequestDto,
  ): Promise<RecordViolationResultDto> {
    const incidentId = crypto.randomUUID();
    const sha256Hash = crypto
      .createHash("sha256")
      .update(
        `${incidentId}-${dto.quizId}-${dto.violationType}-${dto.timestamp}`,
      )
      .digest("hex");

    // Pemetaan tipe pelanggaran ke enum Prisma ViolationType
    const mapViolationType = (type: string): ViolationType => {
      switch (type) {
        case "BLUR_WINDOW":
          return ViolationType.WINDOW_BLUR;
        case "DEVTOOLS_OPEN":
          return ViolationType.DEVTOOLS_OPEN;
        case "SPLIT_SCREEN":
          return ViolationType.MULTI_MONITOR;
        default:
          return ViolationType.TAB_SWITCH;
      }
    };

    return prisma.$transaction(async (tx) => {
      // 1. Cari atau buat sesi pengerjaan attempt
      let attemptRecord = await tx.examAttemptRecord.findFirst({
        where: {
          quizId: dto.quizId,
          ...(dto.attemptId ? { attemptId: dto.attemptId } : {}),
        },
      });

      if (!attemptRecord) {
        attemptRecord = await tx.examAttemptRecord.create({
          data: {
            id: crypto.randomUUID(),
            quizId: dto.quizId,
            userId:
              dto.studentIdentifier &&
              !Number.isNaN(Number(dto.studentIdentifier))
                ? Number(dto.studentIdentifier)
                : 0,
            attemptId:
              dto.attemptId ?? Math.floor(100000 + Math.random() * 900000),
            status: AttemptStatus.IN_PROGRESS,
            violationCount: 0,
            maxAllowedViolations: 3,
            isLockedByProctor: false,
          },
        });
      }

      // 2. Simpan bukti pelanggaran ke violation_records
      await tx.violationRecord.create({
        data: {
          id: incidentId,
          attemptRecordId: attemptRecord.id,
          type: mapViolationType(dto.violationType),
          localFilePath: `public/uploads/evidences/${incidentId}.jpg`,
          fileUrl:
            dto.screenshotBase64 ?? `/uploads/evidences/${incidentId}.jpg`,
          sha256Hash,
          metadata: {
            reason: dto.reason,
            timestamp: dto.timestamp,
            rawType: dto.violationType,
          },
          createdAt: new Date(dto.timestamp),
        },
      });

      // 3. Tambah hitungan pelanggaran dan kunci jika mencapai batas toleransi
      const newCount = attemptRecord.violationCount + 1;
      const willLock = newCount >= attemptRecord.maxAllowedViolations;

      await tx.examAttemptRecord.update({
        where: { id: attemptRecord.id },
        data: {
          violationCount: newCount,
          isLockedByProctor: willLock,
          status: willLock ? AttemptStatus.LOCKED : attemptRecord.status,
          disqualificationReason: willLock
            ? dto.reason
            : attemptRecord.disqualificationReason,
        },
      });

      return {
        success: true,
        isLocked: willLock,
        currentViolations: newCount,
        remainingTolerance: Math.max(
          0,
          attemptRecord.maxAllowedViolations - newCount,
        ),
        incidentId,
      };
    });
  }

  public async lockAttempt(
    attemptId: number,
    reason?: string,
  ): Promise<boolean> {
    const result = await prisma.examAttemptRecord.updateMany({
      where: { attemptId },
      data: {
        isLockedByProctor: true,
        status: AttemptStatus.LOCKED,
        ...(reason ? { disqualificationReason: reason } : {}),
      },
    });

    return result.count > 0;
  }
}

export default PrismaExamSessionRepository;
