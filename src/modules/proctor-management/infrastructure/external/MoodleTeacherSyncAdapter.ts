// src/modules/proctor-management/infrastructure/external/MoodleTeacherSyncAdapter.ts
import type {MoodleTeacherSyncAdapterContract} from "../../domain/contract/MoodleTeacherSyncAdapterContract";
import type {MoodleTeacherRawDto} from "../../domain/dto/ProctorManagementResponseDto";
import {ProctorManagementQueryBuilder} from "../builder/ProctorManagementQueryBuilder";
import prisma from "@/lib/prisma";

export class MoodleTeacherSyncAdapter implements MoodleTeacherSyncAdapterContract {
    public async fetchTeachers(): Promise<readonly MoodleTeacherRawDto[]> {
        const query = ProctorManagementQueryBuilder.getMoodleTeacherRawSql();
        return prisma.$queryRawUnsafe<MoodleTeacherRawDto[]>(query);
    }
}