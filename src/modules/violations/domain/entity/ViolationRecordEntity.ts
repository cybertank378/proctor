//Files: src/modules/violations/domain/entity/ViolationRecordEntity.ts

import type {ViolationType} from "@/generated/prisma/enums";

export interface ViolationRecordProps {
  readonly id: string;
  readonly attemptRecordId: string;
  readonly type: ViolationType;
  readonly localFilePath: string;
  readonly fileUrl: string;
  readonly sha256Hash: string;
  readonly metadata: Record<string, unknown>;
  readonly createdAt: Date;
}

export class ViolationRecordEntity {
  public readonly id: string;
  public readonly attemptRecordId: string;
  public readonly type: ViolationType;
  public readonly localFilePath: string;
  public readonly fileUrl: string;
  public readonly sha256Hash: string;
  public readonly metadata: Record<string, unknown>;
  public readonly createdAt: Date;

  constructor(props: ViolationRecordProps) {
    if (!props.id?.trim()) {
      throw new Error("ID catatan pelanggaran tidak boleh kosong.");
    }
    if (!props.attemptRecordId?.trim()) {
      throw new Error("ID attempt pengerjaan tidak boleh kosong.");
    }
    if (!props.localFilePath.trim() || !props.fileUrl.trim()) {
      throw new Error(
        "Lokasi fisik (localFilePath) dan URL bukti file tidak boleh kosong.",
      );
    }

    const normalizedHash = props.sha256Hash.trim().toLowerCase();
    if (
      normalizedHash.length !== 64 ||
      !/^[a-f0-9]{64}$/.test(normalizedHash)
    ) {
      throw new Error(
        "Checksum SHA-256 bukti pelanggaran wajib 64 karakter heksadesimal.",
      );
    }

    this.id = props.id;
    this.attemptRecordId = props.attemptRecordId;
    this.type = props.type;
    this.localFilePath = props.localFilePath;
    this.fileUrl = props.fileUrl;
    this.sha256Hash = normalizedHash;
    this.metadata = props.metadata;
    this.createdAt = props.createdAt;
  }
}
