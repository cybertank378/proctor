//Files: src/modules/proctor-chat/infrastructure/repository/PrismaProctorChatRepository.ts
import type {ProctorChatRepositoryContract} from "../../domain/contract/ProctorChatRepositoryContract";
import {ProctorChatMessageEntity} from "../../domain/entity/ProctorChatMessageEntity";
import {ProctorChatQueryBuilder} from "../builder/ProctorChatQueryBuilder";
import prisma from "@/lib/prisma";

export class PrismaProctorChatRepository implements ProctorChatRepositoryContract {
    public async create(message: ProctorChatMessageEntity): Promise<ProctorChatMessageEntity> {
        const record = await prisma.proctorChatMessageRecord.create({
            data: {
                id: message.id,
                quizId: message.quizId,
                roomNumber: message.roomNumber,
                senderId: message.senderId,
                senderName: message.senderName,
                role: message.role,
                content: message.content,
                createdAt: message.createdAt,
            },
        });

        return new ProctorChatMessageEntity(record);
    }

    public async findRecentByQuiz(filter: {
        readonly quizId: number;
        readonly roomNumber?: string | null;
        readonly limit: number;
    }): Promise<readonly ProctorChatMessageEntity[]> {
        const where = ProctorChatQueryBuilder.byQuizAndRoom(filter.quizId, filter.roomNumber);

        const records = await prisma.proctorChatMessageRecord.findMany({
            where,
            take: filter.limit,
            orderBy: { createdAt: "asc" },
        });

        return records.map((rec) => new ProctorChatMessageEntity(rec));
    }

    public async deleteOlderThan(cutoffDate: Date): Promise<number> {
        const result = await prisma.proctorChatMessageRecord.deleteMany({
            where: ProctorChatQueryBuilder.byCutoffDate(cutoffDate),
        });

        return result.count;
    }
}