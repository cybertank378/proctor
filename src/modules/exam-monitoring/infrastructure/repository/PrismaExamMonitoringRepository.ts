// Files: src/modules/exam-monitoring/infrastructure/repository/PrismaExamMonitoringRepository.ts

import type {ExamAttemptRecord, Prisma} from "@/generated/prisma/client";
import prisma from "@/lib/prisma";
import type {MoodleActiveAttemptItem} from "@/shared/contract/MoodleRpcClientContract";
import type {ExamMonitoringRepositoryContract} from "../../domain/contract/ExamMonitoringRepositoryContract";
import {type AttemptStatus, ExamAttemptEntity,} from "../../domain/entity/ExamAttemptEntity";
import {ExamMonitoringQueryBuilder} from "../builder/ExamMonitoringQueryBuilder";

export class PrismaExamMonitoringRepository
  implements ExamMonitoringRepositoryContract
{
  public async findByAttemptId(
    attemptId: number,
  ): Promise<ExamAttemptEntity | null> {
    try {
      const record = await prisma.examAttemptRecord.findUnique({
        where: { attemptId },
      });
      if (!record) return null;
      return this.toEntity(record);
    } catch (error: unknown) {
      console.error("[ERROR findByAttemptId]:", error);
      return null;
    }
  }

  public async findActiveAttempts(filter: {
    readonly quizId?: number;
    readonly roomNumber?: string | null;
    readonly status?: string;
    readonly skip: number;
    readonly take: number;
  }): Promise<{ readonly items: ExamAttemptEntity[]; readonly total: number }> {
    try {
      const where = ExamMonitoringQueryBuilder.buildFilter(filter);

      console.log("[DEBUG MONITORING QUERY WHERE]:", JSON.stringify(where));

      const [records, total] = await Promise.all([
        prisma.examAttemptRecord.findMany({
          where,
          skip: filter.skip,
          take: filter.take,
          orderBy: { updatedAt: "desc" },
        }),
        prisma.examAttemptRecord.count({ where }),
      ]);

      console.log(
        `[DEBUG MONITORING FOUND]: ${records.length} baris dari total ${total}`,
      );

      return {
        items: records.map((r) => this.toEntity(r)),
        total,
      };
    } catch (error: unknown) {
      console.error("[ERROR findActiveAttempts]:", error);
      return { items: [], total: 0 };
    }
  }

  public async unlockAttempt(
    attemptId: number,
    proctorId: string,
  ): Promise<ExamAttemptEntity> {
    const updated = await prisma.examAttemptRecord.update({
      where: { attemptId },
      data: {
        status: "IN_PROGRESS",
        isLockedByProctor: false,
        unlockedByProctorId: proctorId,
        updatedAt: new Date(),
      },
    });
    return this.toEntity(updated);
  }

  public async findActiveQuizByRoom(
    roomNumber?: string | null,
  ): Promise<number | null> {
    try {
      const record = await prisma.examAttemptRecord.findFirst({
        where: {
          ...(roomNumber && roomNumber.trim().length > 0
            ? { roomNumber: roomNumber.trim() }
            : {}),
        },
        orderBy: { updatedAt: "desc" },
        select: { quizId: true },
      });
      return record?.quizId ?? null;
    } catch {
      return null;
    }
  }

  public async findLatestQuizId(): Promise<number | null> {
    try {
      const record = await prisma.examAttemptRecord.findFirst({
        orderBy: { createdAt: "desc" },
        select: { quizId: true },
      });
      return record?.quizId ?? null;
    } catch {
      return null;
    }
  }

  public async syncMoodleAttempts(
    moodleAttempts: readonly MoodleActiveAttemptItem[],
  ): Promise<void> {
    if (!moodleAttempts || moodleAttempts.length === 0) return;

    try {
      await prisma.$transaction(
        moodleAttempts.map((item) => {
          const attemptData: Prisma.ExamAttemptRecordUncheckedCreateInput = {
            quizId: item.quizId,
            userId: item.userId,
            attemptId: item.attemptId,
            studentName: item.studentName,
            className: item.className,
            roomNumber: item.roomNumber ?? "Umum",
            status: (item.status === "finished"
              ? "COMPLETED"
              : "IN_PROGRESS") as AttemptStatus,
            violationCount: 0,
            maxAllowedViolations: 3,
            isLockedByProctor: Boolean(item.islocked),
            createdAt: new Date(
              item.timestart > 0 ? item.timestart * 1000 : Date.now(),
            ),
            updatedAt: new Date(),
          };

          return prisma.examAttemptRecord.upsert({
            where: { attemptId: item.attemptId },
            update: {
              studentName: item.studentName,
              className: item.className,
              status: (item.status === "finished" ? "COMPLETED" : undefined) as
                | AttemptStatus
                | undefined,
              updatedAt: new Date(),
            },
            create: attemptData,
          });
        }),
      );
    } catch (error: unknown) {
      console.error("[ERROR syncMoodleAttempts]:", error);
    }
  }

  private toEntity(record: ExamAttemptRecord): ExamAttemptEntity {
    const raw = record as unknown as Record<string, unknown>;

    const studentName =
      typeof raw.studentName === "string" ? raw.studentName : null;
    const className = typeof raw.className === "string" ? raw.className : null;

    return new ExamAttemptEntity({
      id: record.id,
      quizId: record.quizId,
      userId: record.userId,
      attemptId: record.attemptId,
      studentName,
      className,
      roomNumber: record.roomNumber,
      status: record.status as AttemptStatus,
      violationCount: record.violationCount,
      maxAllowedViolations: record.maxAllowedViolations,
      disqualificationReason: record.disqualificationReason,
      isLockedByProctor: record.isLockedByProctor,
      unlockedByProctorId: record.unlockedByProctorId,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }
}
