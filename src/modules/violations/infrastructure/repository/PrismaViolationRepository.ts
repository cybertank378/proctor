//Files: src/modules/violations/infrastructure/repository/PrismaViolationRepository.ts
import type {ViolationRepositoryContract} from "../../domain/contract/ViolationRepositoryContract";
import {ViolationRecordEntity} from "../../domain/entity/ViolationRecordEntity";
import {ViolationQueryBuilder} from "../builder/ViolationQueryBuilder";
import prisma from "@/lib/prisma";

export class PrismaViolationRepository implements ViolationRepositoryContract {
    public async create(entity: ViolationRecordEntity): Promise<ViolationRecordEntity> {
        const record = await prisma.violationRecord.create({
            data: {
                id: entity.id,
                attemptRecordId: entity.attemptRecordId,
                type: entity.type,
                localFilePath: entity.localFilePath,
                fileUrl: entity.fileUrl,
                sha256Hash: entity.sha256Hash,
                metadata: entity.metadata as object,
                createdAt: entity.createdAt,
            },
        });

        return new ViolationRecordEntity({
            ...record,
            metadata: record.metadata as Record<string, unknown>,
        });
    }

    public async findById(id: string): Promise<ViolationRecordEntity | null> {
        const record = await prisma.violationRecord.findUnique({
            where: ViolationQueryBuilder.byId(id),
        });

        if (!record) {
            return null;
        }

        return new ViolationRecordEntity({
            ...record,
            metadata: record.metadata as Record<string, unknown>,
        });
    }

    public async findByAttemptRecordId(
        attemptRecordId: string
    ): Promise<readonly ViolationRecordEntity[]> {
        const records = await prisma.violationRecord.findMany({
            where: ViolationQueryBuilder.byAttempt(attemptRecordId),
            orderBy: { createdAt: "desc" },
        });

        return records.map(
            (r) =>
                new ViolationRecordEntity({
                    ...r,
                    metadata: r.metadata as Record<string, unknown>,
                })
        );
    }

    public async incrementViolationCounter(attemptRecordId: string): Promise<{
        readonly newCount: number;
        readonly maxAllowed: number;
        readonly isLocked: boolean;
    }> {
        const attempt = await prisma.examAttemptRecord.findUnique({
            where: { id: attemptRecordId },
        });

        if (!attempt) {
            throw new Error("Sesi pengerjaan siswa tidak ditemukan saat memperbarui hitungan pelanggaran.");
        }

        const nextCount = attempt.violationCount + 1;
        const shouldLock = nextCount >= attempt.maxAllowedViolations;

        const updated = await prisma.examAttemptRecord.update({
            where: { id: attemptRecordId },
            data: {
                violationCount: nextCount,
                isLockedByProctor: shouldLock ? true : attempt.isLockedByProctor,
                status: shouldLock && attempt.status === "IN_PROGRESS" ? "LOCKED" : attempt.status,
            },
        });

        return {
            newCount: updated.violationCount,
            maxAllowed: updated.maxAllowedViolations,
            isLocked: updated.isLockedByProctor,
        };
    }
}