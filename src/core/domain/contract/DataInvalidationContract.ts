//Files: src/core/domain/contract/DataInvalidationContract.ts
export interface DataInvalidationContract {
  /**
   * Menginvalisasi cache berbasis tag identitas tunggal
   */
  invalidate(tag: string): Promise<void>;

  /**
   * Menginvalisasi sekumpulan tag cache secara bersamaan
   */
  invalidateMany(tags: readonly string[]): Promise<void>;
}
