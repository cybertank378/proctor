//Files: src/modules/violations/domain/contract/ViolationRepositoryContract.ts
import type { ViolationRecordEntity } from "../entity/ViolationRecordEntity";

export interface ViolationRepositoryContract {
  create(entity: ViolationRecordEntity): Promise<ViolationRecordEntity>;
  findById(id: string): Promise<ViolationRecordEntity | null>;
  findByAttemptRecordId(
    attemptRecordId: string,
  ): Promise<readonly ViolationRecordEntity[]>;
  incrementViolationCounter(attemptRecordId: string): Promise<{
    readonly newCount: number;
    readonly maxAllowed: number;
    readonly isLocked: boolean;
  }>;
}
