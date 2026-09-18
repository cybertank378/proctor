//Files: src/modules/proctor-management/presentations/mapper/ProctorManagementPresentationMapper.ts
import type {ProctorSummaryResponseDto} from "../../domain/dto/ProctorManagementResponseDto";

export interface ProctorSelectOptionViewModel {
    readonly id: string;
    readonly label: string;
    readonly currentRoom: string;
    readonly isChief: boolean;
}

export class ProctorManagementPresentationMapper {
    public static toSelectOptions(dtos: readonly ProctorSummaryResponseDto[]): readonly ProctorSelectOptionViewModel[] {
        return dtos.map((dto) => ({
            id: dto.id,
            label: `${dto.fullName} (@${dto.username})`,
            currentRoom: dto.roomNumber ? `Ruang: ${dto.roomNumber}` : "Belum Ada Ruang",
            isChief: dto.role === "CHIEF_PROCTOR",
        }));
    }
}