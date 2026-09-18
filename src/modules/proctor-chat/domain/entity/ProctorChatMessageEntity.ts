//Files: src/modules/proctor-chat/domain/entity/ProctorChatMessageEntity.ts
import type {ProctorRole} from "@/modules/auth/domain/entity/ProctorUserEntity";

export interface ProctorChatMessageProps {
    readonly id: string;
    readonly quizId: number;
    readonly roomNumber: string | null;
    readonly senderId: string;
    readonly senderName: string;
    readonly role: ProctorRole;
    readonly content: string;
    readonly createdAt: Date;
}

export class ProctorChatMessageEntity {
    public readonly id: string;
    public readonly quizId: number;
    public readonly roomNumber: string | null;
    public readonly senderId: string;
    public readonly senderName: string;
    public readonly role: ProctorRole;
    public readonly content: string;
    public readonly createdAt: Date;

    constructor(props: ProctorChatMessageProps) {
        if (!props.id || !props.id.trim()) {
            throw new Error("ID pesan koordinasi pengawas tidak boleh kosong.");
        }
        if (props.quizId <= 0) {
            throw new Error("ID kuis Moodle harus berupa bilangan bulat positif.");
        }
        if (!props.senderId || !props.senderId.trim()) {
            throw new Error("ID pengawas pengirim pesan tidak boleh kosong.");
        }
        if (!props.senderName || !props.senderName.trim()) {
            throw new Error("Nama pengirim pesan tidak boleh kosong.");
        }

        const trimmedContent = props.content ? props.content.trim() : "";
        if (!trimmedContent) {
            throw new Error("Isi pesan koordinasi pengawas tidak boleh kosong.");
        }
        if (trimmedContent.length > 500) {
            throw new Error("Isi pesan koordinasi melebihi batas toleransi 500 karakter.");
        }

        this.id = props.id;
        this.quizId = props.quizId;
        this.roomNumber = props.roomNumber ? props.roomNumber.trim() : null;
        this.senderId = props.senderId;
        this.senderName = props.senderName.trim();
        this.role = props.role;
        this.content = trimmedContent;
        this.createdAt = props.createdAt;
    }

    public isBroadcast(): boolean {
        return this.roomNumber === null;
    }

    public isSentBy(proctorId: string): boolean {
        if (!proctorId || !proctorId.trim()) {
            return false;
        }
        return this.senderId === proctorId.trim();
    }
}