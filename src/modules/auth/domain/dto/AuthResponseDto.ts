//Files: src/modules/auth/domain/dto/AuthResponseDto.ts
import type {ProctorRole} from "../entity/ProctorUserEntity";

export interface LoginResponseDto {
    readonly tokenType: "Bearer";
    readonly accessToken: string;
    readonly expiresAt: string;
    readonly user: {
        readonly id: string;
        readonly username: string;
        readonly fullName: string;
        readonly role: ProctorRole;
        readonly roomNumber: string | null;
    };
}

export interface CurrentSessionResponseDto {
    readonly id: string;
    readonly username: string;
    readonly fullName: string;
    readonly role: ProctorRole;
    readonly roomNumber: string | null;
    readonly moodleUserId: number | null;
}