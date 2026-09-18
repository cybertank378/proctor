//Files: src/modules/proctor-management/domain/entity/ProctorUserEntity.ts
import type {ProctorRole} from "@/generated/prisma/enums";

export interface ProctorUserEntityProps {
    readonly id: string;
    readonly moodleUserId: number | null;
    readonly username: string;
    readonly fullName: string;
    readonly role: ProctorRole;
    readonly roomNumber: string | null;
    readonly isActive: boolean;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}

export class ProctorUserEntity {
    constructor(private readonly props: ProctorUserEntityProps) {}

    get id(): string { return this.props.id; }
    get moodleUserId(): number | null { return this.props.moodleUserId; }
    get username(): string { return this.props.username; }
    get fullName(): string { return this.props.fullName; }
    get role(): ProctorRole { return this.props.role; }
    get roomNumber(): string | null { return this.props.roomNumber; }
    get isActive(): boolean { return this.props.isActive; }
    get createdAt(): Date { return this.props.createdAt; }
    get updatedAt(): Date { return this.props.updatedAt; }

    public isChiefProctor(): boolean {
        return this.props.role === "CHIEF_PROCTOR";
    }

    public isAssignedToRoom(room: string): boolean {
        if (this.isChiefProctor()) return true;
        return this.props.roomNumber?.toLowerCase() === room.toLowerCase();
    }
}