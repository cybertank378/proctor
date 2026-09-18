//Files: src/modules/proctor-management/application/usecase/SyncMoodleTeachersUseCase.ts
import type {Argon2PasswordHasher} from "@/modules/auth/infrastructure/security/Argon2PasswordHasher";
import type {MoodleTeacherSyncAdapterContract} from "../../domain/contract/MoodleTeacherSyncAdapterContract";
import type {ProctorManagementRepositoryContract} from "../../domain/contract/ProctorManagementRepositoryContract";
import type {ProctorSummaryResponseDto} from "../../domain/dto/ProctorManagementResponseDto";
import {AppResult} from "@/core/application/result/AppResult";
import {AppResultFactory} from "@/core/application/result/AppResultFactory";

export class SyncMoodleTeachersUseCase {
    constructor(
        private readonly moodleAdapter: MoodleTeacherSyncAdapterContract,
        private readonly repository: ProctorManagementRepositoryContract,
        private readonly passwordHasher: Argon2PasswordHasher
    ) {}

    public async execute(defaultPassword = "MoodleProctor2026!"): Promise<AppResult<readonly ProctorSummaryResponseDto[]>> {
        try {
            const teachers = await this.moodleAdapter.fetchTeachers();
            const defaultHash = await this.passwordHasher.hash(defaultPassword);

            for (const t of teachers) {
                const existingByMoodleId = await this.repository.findByMoodleUserId(Number(t.user_id));
                const existingByUsername = await this.repository.findByUsername(t.username);

                if (!existingByMoodleId && !existingByUsername) {
                    const fullName = `${t.firstname} ${t.lastname}`.trim();
                    await this.repository.create({
                        username: t.username,
                        passwordHash: defaultHash,
                        fullName,
                        role: "PROCTOR",
                        roomNumber: null,
                        moodleUserId: Number(t.user_id),
                    });
                }
            }

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
                `Berhasil menyinkronkan ${teachers.length} guru pengawas dari database Moodle.`
            );
        } catch (error) {
            return AppResultFactory.failure(
                `Gagal menyinkronkan guru Moodle: ${error instanceof Error ? error.message : String(error)}`,
                500
            );
        }
    }
}