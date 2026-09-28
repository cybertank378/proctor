//Files: src/modules/violations/domain/dto/ViolationResponseDto.ts

import type { ViolationType } from "@/generated/prisma/enums";

export interface ViolationSummaryDto {
  readonly id: string;
  readonly attemptRecordId: string;
  readonly type: ViolationType;
  readonly fileUrl: string;
  readonly sha256Hash: string;
  readonly metadata: Record<string, unknown>;
  readonly createdAt: string;
}

export interface VerifyIntegrityResultDto {
  readonly violationId: string;
  readonly isAuthentic: boolean;
  readonly expectedHash: string;
  readonly calculatedHash: string;
}
