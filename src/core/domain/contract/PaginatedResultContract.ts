//Files: src/core/domain/contract/PaginatedResultContract.ts
export interface PaginatedMetaContract {
  readonly page: number;
  readonly pageSize: number;
  readonly totalItems: number;
  readonly totalPages: number;
  readonly hasNextPage: boolean;
  readonly hasPrevPage: boolean;
}

export interface PaginatedResultContract<T> {
  readonly items: readonly T[];
  readonly meta: PaginatedMetaContract;
}
