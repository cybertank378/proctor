// src/modules/exam-monitoring/application/usecase/GetActiveQuizUseCase.ts
import {BaseUseCase} from "@/core/application/base/BaseUseCase";
import {AppResult} from "@/core/application/result/AppResult";
import {AppResultFactory} from "@/core/application/result/AppResultFactory";
import type {ProctorUserEntity} from "@/modules/auth/domain/entity/ProctorUserEntity";
import {RoomScopeHelper} from "@/shared/helpers/RoomScopeHelper";
import type {MoodleRpcClientContract} from "@/shared/contract/MoodleRpcClientContract";
import type {ExamMonitoringRepositoryContract} from "../../domain/contract/ExamMonitoringRepositoryContract";
import type {ActiveQuizResolutionDto} from "../../domain/dto/MonitoringResponseDto";
import {MonitoringPresentationMapper} from "../../presentations/mapper/MonitoringPresentationMapper";

export interface GetActiveQuizContext {
    readonly roomNumber?: string | null;
    readonly proctor: ProctorUserEntity;
}

export class GetActiveQuizUseCase extends BaseUseCase<
    GetActiveQuizContext,
    ActiveQuizResolutionDto | null
> {
    constructor(
        private readonly repository: ExamMonitoringRepositoryContract,
        private readonly moodleRpcClient: MoodleRpcClientContract
    ) {
        super();
    }

    public async execute(
        input: GetActiveQuizContext
    ): Promise<AppResult<ActiveQuizResolutionDto | null>> {
        const targetRoom = RoomScopeHelper.resolveFilterRoom(
            input.proctor.role,
            input.proctor.roomNumber,
            input.roomNumber
        );

        // 1. Sesi siswa aktif di ruangan
        const sessionQuizId = await this.repository.findActiveQuizByRoom(targetRoom);
        if (sessionQuizId && sessionQuizId > 0) {
            return AppResultFactory.success(
                MonitoringPresentationMapper.toActiveQuizDto(sessionQuizId, "ACTIVE_SESSION")
            );
        }

        // 2. Jadwal kuis aktif dari Moodle RPC
        const moodleQuizzes = await this.moodleRpcClient.getActiveQuizzes();
        if (moodleQuizzes.length > 0 && moodleQuizzes[0].quizId > 0) {
            return AppResultFactory.success(
                MonitoringPresentationMapper.toActiveQuizDto(
                    moodleQuizzes[0].quizId,
                    "MOODLE_SCHEDULE",
                    moodleQuizzes[0].quizName
                )
            );
        }

        // 3. Rekam jejak terakhir di database lokal
        const latestQuizId = await this.repository.findLatestQuizId();
        if (latestQuizId && latestQuizId > 0) {
            return AppResultFactory.success(
                MonitoringPresentationMapper.toActiveQuizDto(latestQuizId, "FALLBACK_HISTORY")
            );
        }

        // Tidak ada kuis -> sukses dengan nilai null (HTTP 200)
        return AppResultFactory.success(null);
    }
}