// Files: src/modules/exam-session/infrastructure/repository/PrismaExamSessionRepository.ts
import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { AttemptStatus, ViolationType } from "@/generated/prisma/enums";
import prisma from "@/lib/prisma";
import type { ExamSessionRepositoryContract } from "../../domain/contract/ExamSessionRepositoryContract";
import type { RecordViolationRequestDto } from "../../domain/dto/ExamSessionRequestDto";
import type { RecordViolationResultDto } from "../../domain/dto/ExamSessionResponseDto";
import { ExamSessionEntity } from "../../domain/entity/ExamSessionEntity";

export function resolveViolationType(
  type: ViolationType | string,
): ViolationType {
  switch (type) {
    case "WINDOW_BLUR":
    case "BLUR_WINDOW":
      return ViolationType.WINDOW_BLUR;
    case "DEVTOOLS_OPEN":
      return ViolationType.DEVTOOLS_OPEN;
    case "RESTRICTED_KEY":
      return ViolationType.RESTRICTED_KEY;
    case "MULTI_MONITOR":
    case "SPLIT_SCREEN":
      return ViolationType.MULTI_MONITOR;
    default:
      return ViolationType.TAB_SWITCH;
  }
}

export class PrismaExamSessionRepository
  implements ExamSessionRepositoryContract
{
  public async findSessionByAttempt(
    quizId: number,
    attemptId?: number,
  ): Promise<ExamSessionEntity | null> {
    const record = await prisma.examAttemptRecord.findFirst({
      where: {
        quizId,
        ...(attemptId ? { attemptId } : {}),
      },
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
    const fileName = `${incidentId}.png`; // <-- Menggunakan ekstensi .png
    const relativePath = `assets/images/evidences/${fileName}`; // <-- Sesuai permintaan
    const targetDir = path.join(
      process.cwd(),
      "public",
      "assets",
      "images",
      "evidences",
    );
    const absoluteFilePath = path.join(targetDir, fileName);

    // Simpan buffer Base64 PNG ke filesystem lokal server
    if (dto.screenshotBase64 && dto.screenshotBase64.includes("base64,")) {
      try {
        const base64Data = dto.screenshotBase64.split("base64,")[1];
        await fs.mkdir(targetDir, { recursive: true });
        await fs.writeFile(absoluteFilePath, Buffer.from(base64Data, "base64"));
      } catch (err) {
        console.warn("[REPOSITORY] Gagal menyimpan file bukti PNG:", err);
      }
    }

    const sha256Hash = crypto
      .createHash("sha256")
      .update(
        `${incidentId}-${dto.quizId}-${dto.violationType}-${dto.timestamp}`,
      )
      .digest("hex");

    const validViolationType = resolveViolationType(dto.violationType);
    const validUserId =
      dto.studentIdentifier && !Number.isNaN(Number(dto.studentIdentifier))
        ? Number(dto.studentIdentifier)
        : 999;

    return prisma.$transaction(async (tx) => {
      // 1. Cari atau buat attempt pengerjaan siswa
      let attemptRecord = await tx.examAttemptRecord.findFirst({
        where: {
          quizId: dto.quizId,
          ...(dto.attemptId && dto.attemptId > 0
            ? { attemptId: dto.attemptId }
            : {}),
        },
        orderBy: { updatedAt: "desc" },
      });

      if (!attemptRecord) {
        const generatedAttemptId =
          dto.attemptId && dto.attemptId > 0
            ? dto.attemptId
            : Math.floor(100000 + Math.random() * 900000);

        attemptRecord = await tx.examAttemptRecord.create({
          data: {
            id: crypto.randomUUID(),
            quizId: dto.quizId,
            userId: validUserId,
            attemptId: generatedAttemptId,
            roomNumber: "Lab 01",
            status: AttemptStatus.IN_PROGRESS,
            violationCount: 0,
            maxAllowedViolations: 3,
            isLockedByProctor: false,
          },
        });
      }

      // 2. Simpan record bukti pelanggaran (hanya nama file untuk fileUrl)
      await tx.violationRecord.create({
        data: {
          id: incidentId,
          attemptRecordId: attemptRecord.id,
          type: validViolationType,
          localFilePath: relativePath, // assets/images/evidences/<id>.png
          fileUrl: fileName, // <id>.png
          sha256Hash,
          metadata: {
            reason: dto.reason,
            timestamp: dto.timestamp,
            rawType: dto.violationType,
          },
          createdAt: new Date(dto.timestamp),
        },
      });

      // 3. Tambah hitungan pelanggaran
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
