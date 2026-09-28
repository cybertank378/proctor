//Files: src/modules/violations/domain/policy/ViolationThresholdPolicy.ts
export const ViolationThresholdPolicy = {
  shouldLockAttempt(currentCount: number, maxAllowed: number): boolean {
    return currentCount >= maxAllowed;
  },

  shouldDisqualify(currentCount: number, maxAllowed: number): boolean {
    // Diskualifikasi jika toleransi terlampaui lebih dari 2 insiden pasca-kunci
    return currentCount >= maxAllowed + 2;
  },
};
