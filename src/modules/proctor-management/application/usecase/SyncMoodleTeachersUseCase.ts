// src/modules/proctor-management/application/usecase/SyncMoodleTeachersUseCase.ts
import {AppResult} from "@/core/application/result/AppResult";
import prisma from "@/lib/prisma";
import type {Argon2PasswordHasher} from "@/modules/auth/infrastructure/security/Argon2PasswordHasher";
import type {MoodleTeacherSyncAdapterContract} from "../../domain/contract/MoodleTeacherSyncAdapterContract";
import type {ProctorManagementRepositoryContract} from "../../domain/contract/ProctorManagementRepositoryContract";
import type {ProctorSummaryResponseDto} from "../../domain/dto/ProctorManagementResponseDto";
import {AppResultFactory} from "@/core/application/result/AppResultFactory";

export class SyncMoodleTeachersUseCase {
    constructor(
        private readonly moodleAdapter: MoodleTeacherSyncAdapterContract,
        private readonly repository: ProctorManagementRepositoryContract,
        private readonly passwordHasher: Argon2PasswordHasher
    ) {}

    public async execute(defaultPassword = "Password123!"): Promise<AppResult<readonly ProctorSummaryResponseDto[]>> {
        try {
            const teachers = await this.moodleAdapter.fetchTeachers();

            if (teachers.length === 0) {
                return AppResultFactory.failure("Tidak ada data guru yang diterima dari Moodle.", 404);
            }

            const defaultHash = await this.passwordHasher.hash(defaultPassword);

            // Gunakan batch upsert langsung ke Prisma untuk menghindari konflik constraint
            for (const t of teachers) {
                const rawName = `${t.firstname} ${t.lastname}`.trim();
                const fullName = rawName.length > 100 ? rawName.slice(0, 100) : rawName;
                const moodleId = Number(t.user_id);
                const username = String(t.username).trim().slice(0, 50);

                // Periksa apakah sudah ada user berdasarkan username atau moodleUserId
                const existing = await prisma.proctorUser.findFirst({
                    where: {
                        OR: [
                            { username },
                            { moodleUserId: moodleId },
                        ],
                    },
                });

                if (existing) {
                    await prisma.proctorUser.update({
                        where: { id: existing.id },
                        data: {
                            fullName,
                            moodleUserId: moodleId,
                        },
                    });
                } else {
                    await prisma.proctorUser.create({
                        data: {
                            username,
                            passwordHash: defaultHash,
                            fullName,
                            role: "PROCTOR",
                            roomNumber: null,
                            moodleUserId: moodleId,
                        },
                    });
                }
            }

            // Ambil seluruh daftar pengawas terbaru
            const updatedList = await this.repository.list();
            const summaries: ProctorSummaryResponseDto[] = updatedList.map((p) => ({
                id: p.id,
                username: p.username,
                fullName: p.fullName,
                role: p.role,
                roomNumber: p.roomNumber,
                isActive: p.isActive,
                moodleUserId: p.moodleUserId,
                createdAt: p.createdAt.toISOString(),
                updatedAt: p.updatedAt.toISOString(),
            }));

            return AppResultFactory.success(
                summaries,
                `Berhasil menyinkronkan ${teachers.length} guru pengawas dari Moodle.`
            );
        } catch (error) {
            const msg = error instanceof Error ? error.message : String(error);
            return AppResultFactory.failure(`Sinkronisasi gagal: ${msg}`, 500);
        }
    }
}