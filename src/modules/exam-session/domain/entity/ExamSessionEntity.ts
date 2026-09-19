// Files: src/modules/exam-session/domain/entity/ExamSessionEntity.ts

export interface ExamSessionProps {
  readonly id: string;
  readonly attemptId: number;
  readonly quizId: number;
  readonly studentIdentifier: string;
  violationCount: number;
  maxAllowedViolations: number;
  isLocked: boolean;
  status: "NOT_STARTED" | "IN_PROGRESS" | "LOCKED" | "COMPLETED";
  readonly createdAt?: Date;
  readonly updatedAt?: Date;
}

export class ExamSessionEntity {
  constructor(private readonly props: ExamSessionProps) {}

  get id(): string {
    return this.props.id;
  }

  get attemptId(): number {
    return this.props.attemptId;
  }

  get quizId(): number {
    return this.props.quizId;
  }

  get studentIdentifier(): string {
    return this.props.studentIdentifier;
  }

  get isLocked(): boolean {
    return this.props.isLocked;
  }

  get violationCount(): number {
    return this.props.violationCount;
  }

  get maxAllowedViolations(): number {
    return this.props.maxAllowedViolations;
  }

  get status(): string {
    return this.props.status;
  }

  public incrementViolation(): void {
    this.props.violationCount += 1;
    if (this.props.violationCount >= this.props.maxAllowedViolations) {
      this.lockSession();
    }
  }

  public lockSession(): void {
    this.props.isLocked = true;
    this.props.status = "LOCKED";
  }

  public unlockSession(): void {
    this.props.isLocked = false;
    this.props.status = "IN_PROGRESS";
  }

  public canResume(): boolean {
    return (
      !this.props.isLocked &&
      this.props.violationCount < this.props.maxAllowedViolations
    );
  }

  public toJSON(): ExamSessionProps {
    return { ...this.props };
  }
}
