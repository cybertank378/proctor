//Files: src/modules/auth/domain/entity/ProctorUserEntity.ts
export type ProctorRole = "CHIEF_PROCTOR" | "PROCTOR";

export interface ProctorUserProps {
  readonly id: string;
  readonly moodleUserId: number | null;
  readonly username: string;
  readonly passwordHash: string;
  readonly fullName: string;
  readonly role: ProctorRole;
  readonly roomNumber: string | null;
  readonly isActive: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export class ProctorUserEntity {
  public readonly id: string;
  public readonly moodleUserId: number | null;
  public readonly username: string;
  public readonly passwordHash: string;
  public readonly fullName: string;
  public readonly role: ProctorRole;
  public readonly roomNumber: string | null;
  public readonly isActive: boolean;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(props: ProctorUserProps) {
    if (!props.id || !props.id.trim()) {
      throw new Error("ID pengawas tidak boleh kosong.");
    }
    if (!props.username || !props.username.trim()) {
      throw new Error("Username pengawas tidak boleh kosong.");
    }
    if (!props.passwordHash || !props.passwordHash.trim()) {
      throw new Error("Password hash pengawas tidak boleh kosong.");
    }

    this.id = props.id;
    this.moodleUserId = props.moodleUserId;
    this.username = props.username;
    this.passwordHash = props.passwordHash;
    this.fullName = props.fullName;
    this.role = props.role;
    this.roomNumber = props.roomNumber;
    this.isActive = props.isActive;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  public isChiefProctor(): boolean {
    return this.role === "CHIEF_PROCTOR";
  }

  public canAccessRoom(targetRoom: string): boolean {
    if (this.isChiefProctor()) {
      return true;
    }
    if (!this.roomNumber || !targetRoom.trim()) {
      return false;
    }
    return this.roomNumber.trim().toLowerCase() === targetRoom.trim().toLowerCase();
  }
}