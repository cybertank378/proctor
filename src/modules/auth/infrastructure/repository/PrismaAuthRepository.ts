//Files: src/modules/auth/infrastructure/repository/PrismaAuthRepository.ts
import type {AuthRepositoryContract} from "../../domain/contract/AuthRepositoryContract";
import {ProctorSessionEntity} from "../../domain/entity/ProctorSessionEntity";
import {ProctorUserEntity} from "../../domain/entity/ProctorUserEntity";
import {AuthQueryBuilder} from "../builder/AuthQueryBuilder";
import prisma from "@/lib/prisma";

export class PrismaAuthRepository implements AuthRepositoryContract {


    public async findByUsername(username: string): Promise<ProctorUserEntity | null> {
        const record = await prisma.proctorUser.findFirst({
            where: AuthQueryBuilder.byActiveUsername(username),
        });

        if (!record) {
            return null;
        }

        return new ProctorUserEntity(record);
    }

    public async findById(id: string): Promise<ProctorUserEntity | null> {
        const record = await prisma.proctorUser.findUnique({
            where: { id },
        });

        if (!record) {
            return null;
        }

        return new ProctorUserEntity(record);
    }

    public async findSessionByToken(token: string): Promise<ProctorSessionEntity | null> {
        const record = await prisma.proctorSession.findFirst({
            where: AuthQueryBuilder.byValidSessionToken(token),
        });

        if (!record) {
            return null;
        }

        return new ProctorSessionEntity(record);
    }

    public async createSession(
        proctorId: string,
        token: string,
        expiresAt: Date
    ): Promise<void> {
        await prisma.proctorSession.create({
            data: {
                proctorId,
                token,
                expiresAt,
            },
        });
    }

    public async deleteSession(token: string): Promise<void> {
        await prisma.proctorSession.deleteMany({
            where: { token },
        });
    }
}