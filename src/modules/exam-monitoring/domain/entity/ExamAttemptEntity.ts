//Files: src/modules/exam-monitoring/domain/entity/ExamAttemptEntity.ts
export type AttemptStatus = "IN_PROGRESS" | "LOCKED" | "DISQUALIFIED" | "COMPLETED";

export interface ExamAttemptProps {
    readonly id: string;
    readonly quizId: number;
    readonly userId: number;
    readonly attemptId: number;
    readonly roomNumber: string | null;
    readonly status: AttemptStatus;
    readonly violationCount: number;
    readonly maxAllowedViolations: number;
    readonly disqualificationReason: string | null;
    readonly isLockedByProctor: boolean;
    readonly unlockedByProctorId: string | null;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}

export class ExamAttemptEntity {
    public readonly id: string;
    public readonly quizId: number;
    public readonly userId: number;
    public readonly attemptId: number;
    public readonly roomNumber: string | null;
    public readonly status: AttemptStatus;
    public readonly violationCount: number;
    public readonly maxAllowedViolations: number;
    public readonly disqualificationReason: string | null;
    public readonly isLockedByProctor: boolean;
    public readonly unlockedByProctorId: string | null;
    public readonly createdAt: Date;
    public readonly updatedAt: Date;

    constructor(props: ExamAttemptProps) {
        if (!props.id || !props.id.trim()) {
            throw new Error("ID pengerjaan kuis tidak boleh kosong.");
        }
        if (props.quizId <= 0 || props.userId <= 0 || props.attemptId <= 0) {
            throw new Error("Identitas quizId, userId, dan attemptId wajib berupa bilangan positif.");
        }
        if (props.violationCount < 0 || props.maxAllowedViolations <= 0) {
            throw new Error("Batas toleransi pelanggaran dan hitungan pelanggaran tidak valid.");
        }

        this.id = props.id;
        this.quizId = props.quizId;
        this.userId = props.userId;
        this.attemptId = props.attemptId;
        this.roomNumber = props.roomNumber;
        this.status = props.status;
        this.violationCount = props.violationCount;
        this.maxAllowedViolations = props.maxAllowedViolations;
        this.disqualificationReason = props.disqualificationReason;
        this.isLockedByProctor = props.isLockedByProctor;
        this.unlockedByProctorId = props.unlockedByProctorId;
        this.createdAt = props.createdAt;
        this.updatedAt = props.updatedAt;
    }

    public isLocked(): boolean {
        return this.status === "LOCKED" || this.isLockedByProctor;
    }

    public isExceededTolerance(): boolean {
        return this.violationCount >= this.maxAllowedViolations;
    }

    public canBeUnlocked(): boolean {
        return this.isLocked() && this.status !== "DISQUALIFIED" && this.status !== "COMPLETED";
    }
}