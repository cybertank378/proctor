// Files: src/modules/exam-monitoring/infrastructure/repository/PrismaExamMonitoringRepository.ts

import prisma from "@/lib/prisma";
import type {ExamMonitoringRepositoryContract} from "../../domain/contract/ExamMonitoringRepositoryContract";
import {ExamAttemptEntity} from "../../domain/entity/ExamAttemptEntity";
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
      return new ExamAttemptEntity(record);
    } catch (error) {
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
        items: records.map((r) => new ExamAttemptEntity(r)),
        total,
      };
    } catch (error) {
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
    return new ExamAttemptEntity(updated);
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
}
