//Files: src/modules/exam-session/domain/contract/MoodleQuizAdapterContract.ts
export interface MoodleQuizAdapterContract {
  getQuizEmbedUrl(
    quizId: number,
    cmid?: number,
    userId?: number,
    signature?: string,
  ): string;
  validateQuizAvailability(quizId: number): Promise<boolean>;
}
