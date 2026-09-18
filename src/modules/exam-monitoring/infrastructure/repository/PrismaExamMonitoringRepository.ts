//Files: src/modules/exam-monitoring/infrastructure/repository/PrismaExamMonitoringRepository.ts
import type {ExamMonitoringRepositoryContract} from "../../domain/contract/ExamMonitoringRepositoryContract";
import {ExamAttemptEntity} from "../../domain/entity/ExamAttemptEntity";
import {ExamMonitoringQueryBuilder} from "../builder/ExamMonitoringQueryBuilder";
import prisma from "@/lib/prisma";

export class PrismaExamMonitoringRepository implements ExamMonitoringRepositoryContract {
    public async findByAttemptId(attemptId: number): Promise<ExamAttemptEntity | null> {
        const record = await prisma.examAttemptRecord.findUnique({
            where: {attemptId},
        });
        if (!record) return null;
        return new ExamAttemptEntity(record);
    }

    public async findActiveAttempts(filter: {
        readonly quizId?: number;
        readonly roomNumber?: string | null;
        readonly status?: string;
        readonly skip: number;
        readonly take: number;
    }): Promise<{ readonly items: ExamAttemptEntity[]; readonly total: number }> {
        const where = ExamMonitoringQueryBuilder.buildFilter(filter);
        const [records, total] = await Promise.all([prisma.examAttemptRecord.findMany({
            where, skip: filter.skip, take: filter.take, orderBy: {updatedAt: "desc"},
        }), prisma.examAttemptRecord.count({where}),]);

        return {
            items: records.map((r) => new ExamAttemptEntity(r)), total,
        };
    }

    public async unlockAttempt(attemptId: number, proctorId: string): Promise<ExamAttemptEntity> {
        const updated = await prisma.examAttemptRecord.update({
            where: {attemptId}, data: {
                status: "IN_PROGRESS", isLockedByProctor: false, unlockedByProctorId: proctorId,
            },
        });
        return new ExamAttemptEntity(updated);
    }
}