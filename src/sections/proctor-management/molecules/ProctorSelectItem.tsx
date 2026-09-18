//Files: src/sections/proctor-management/molecules/ProctorSelectItem.tsx
import type React from "react";
import type {ProctorSummaryResponseDto} from "@/modules/proctor-management/domain/dto/ProctorManagementResponseDto";

interface ProctorSelectItemProps {
    readonly proctor: ProctorSummaryResponseDto;
}

export const ProctorSelectItem: React.FC<ProctorSelectItemProps> = ({ proctor }) => {
    const roomStatus = proctor.roomNumber
        ? `Ruang: ${proctor.roomNumber}`
        : "Belum Ada Ruang";

    const isChief = proctor.role === "CHIEF_PROCTOR";

    return (
        <option value={proctor.id}>
            {proctor.fullName} (@{proctor.username}) — {isChief ? "Ketua Pengawas" : roomStatus}
        </option>
    );
}