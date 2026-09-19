// Files: src/modules/exam-session/infrastructure/builder/ExamSessionQueryBuilder.ts

export const ExamSessionQueryBuilder = {
  byAttempt(quizId: number, attemptId?: number) {
    return {
      quizId,
      ...(attemptId ? { attemptId } : {}),
    };
  },

  byCutoffDate(cutoffDate: Date) {
    return {
      createdAt: {
        lt: cutoffDate,
      },
    };
  },
};
