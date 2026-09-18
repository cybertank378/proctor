//Files: src/modules/proctor-management/application/usecase/ListProctorsUseCase.ts
import type {ProctorManagementRepositoryContract} from "../../domain/contract/ProctorManagementRepositoryContract";
import type {ProctorSummaryResponseDto} from "../../domain/dto/ProctorManagementResponseDto";
import {AppResult} from "@/core/application/result/AppResult";
import {AppResultFactory} from "@/core/application/result/AppResultFactory";

export class ListProctorsUseCase {
    constructor(private readonly repository: ProctorManagementRepositoryContract) {}

    public async execute(roomNumber?: string): Promise<AppResult<readonly ProctorSummaryResponseDto[]>> {
        const records = await this.repository.list(roomNumber);

        const summaries: ProctorSummaryResponseDto[] = records.map((p) => ({
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

        return AppResultFactory.success(summaries);
    }
}