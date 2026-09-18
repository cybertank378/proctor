//Files: src/core/domain/contract/MutationResultContract
export interface MutationResultContract {
  readonly isSuccess: boolean;
  readonly affectedCount: number;
  readonly affectedId?: string | number;
  readonly errorMessage?: string;
  readonly timestamp: Date;
}
