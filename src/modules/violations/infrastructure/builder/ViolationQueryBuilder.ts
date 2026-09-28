//Files: src/modules/violations/infrastructure/builder/ViolationQueryBuilder.ts
export const ViolationQueryBuilder = {
  byAttempt(attemptRecordId: string) {
    return {
      attemptRecordId: attemptRecordId.trim(),
    };
  },

  byId(id: string) {
    return {
      id: id.trim(),
    };
  },
};
