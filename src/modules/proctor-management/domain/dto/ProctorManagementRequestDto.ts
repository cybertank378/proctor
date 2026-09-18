//Files: src/modules/proctor-management/domain/dto/ProctorManagementRequestDto.ts
import {ProctorRole} from "@/generated/prisma/enums";

export interface CreateProctorRequestDto {
    readonly username: string;
    readonly password: string;
    readonly fullName: string;
    readonly role?: ProctorRole;
    readonly roomNumber?: string;
    readonly moodleUserId?: number;
}

export interface AssignProctorRoomRequestDto {
    readonly proctorId: string;
    readonly roomNumber: string;
}