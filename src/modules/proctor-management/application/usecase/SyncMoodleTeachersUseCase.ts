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
            console.log("[SYNC MOODLE] Memulai penarikan data guru dari Web Service...");
            const teachers = await this.moodleAdapter.fetchTeachers();
            console.log(`[SYNC MOODLE] Diterima ${teachers.length} guru dari Moodle.`);

            if (!teachers || teachers.length === 0) {
                return AppResultFactory.failure("Tidak ada data guru yang diterima dari Moodle.", 404);
            }

            const defaultHash = await this.passwordHasher.hash(defaultPassword);

            // Eliminasi duplikasi user_id di memori sebelum masuk ke database
            const uniqueTeachersMap = new Map<number, typeof teachers[0]>();
            for (const t of teachers) {
                if (!uniqueTeachersMap.has(Number(t.user_id))) {
                    uniqueTeachersMap.set(Number(t.user_id), t);
                }
            }

            for (const t of uniqueTeachersMap.values()) {
                const rawName = `${t.firstname} ${t.lastname}`.trim();
                const fullName = rawName.length > 100 ? rawName.slice(0, 100) : rawName;
                const moodleUserId = Number(t.user_id);
                const username = String(t.username).trim().slice(0, 50);

                // Cari apakah akun pengawas sudah ada berdasarkan username atau moodleUserId
                const existing = await prisma.proctorUser.findFirst({
                    where: {
                        OR: [
                            { username },
                            { moodleUserId },
                        ],
                    },
                });

                if (existing) {
                    // Update data nama dan pastikan moodleUserId terhubung
                    await prisma.proctorUser.update({
                        where: { id: existing.id },
                        data: {
                            fullName,
                            moodleUserId,
                            isActive: true,
                        },
                    });
                } else {
                    // Buat akun baru jika belum terdaftar
                    await prisma.proctorUser.create({
                        data: {
                            username,
                            passwordHash: defaultHash,
                            fullName,
                            role: "PROCTOR",
                            roomNumber: null,
                            moodleUserId,
                            isActive: true,
                        },
                    });
                }
            }

            // Ambil kembali seluruh daftar pengawas dari database lokal
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

            console.log(`[SYNC MOODLE] Berhasil menyinkronkan total ${summaries.length} akun pengawas.`);

            return AppResultFactory.success(
                summaries,
                `Berhasil menyinkronkan ${uniqueTeachersMap.size} guru pengawas dari Moodle.`
            );
        } catch (error) {
            console.error("[SYNC MOODLE ERROR]", error);
            const msg = error instanceof Error ? error.message : String(error);
            return AppResultFactory.failure(`Gagal sinkronisasi data Moodle: ${msg}`, 500);
        }
    }
}