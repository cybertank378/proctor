//Files: src/modules/auth/domain/entity/ProctorSessionEntity.ts
export interface ProctorSessionProps {
  readonly id: string;
  readonly token: string;
  readonly proctorId: string;
  readonly expiresAt: Date;
  readonly createdAt: Date;
}

export class ProctorSessionEntity {
  public readonly id: string;
  public readonly token: string;
  public readonly proctorId: string;
  public readonly expiresAt: Date;
  public readonly createdAt: Date;

  constructor(props: ProctorSessionProps) {
    if (!props.id || !props.id.trim()) {
      throw new Error("ID sesi tidak boleh kosong.");
    }
    if (!props.token || !props.token.trim()) {
      throw new Error("Token sesi tidak boleh kosong.");
    }
    if (!props.proctorId || !props.proctorId.trim()) {
      throw new Error("ID pengawas pemilik sesi tidak boleh kosong.");
    }

    this.id = props.id;
    this.token = props.token;
    this.proctorId = props.proctorId;
    this.expiresAt = props.expiresAt;
    this.createdAt = props.createdAt;
  }

  public isValid(currentDate: Date = new Date()): boolean {
    return currentDate.getTime() < this.expiresAt.getTime();
  }

  public isExpired(currentDate: Date = new Date()): boolean {
    return !this.isValid(currentDate);
  }

  public belongsTo(proctorId: string): boolean {
    if (!proctorId.trim()) {
      return false;
    }
    return this.proctorId === proctorId;
  }
}
