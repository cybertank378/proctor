// Files: src/modules/exam-session/infrastructure/external/MoodleQuizAdapter.ts

import type {MoodleQuizAdapterContract} from "../../domain/contract/MoodleQuizAdapterContract";

export class MoodleQuizAdapter implements MoodleQuizAdapterContract {
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl =
      process.env.NEXT_PUBLIC_MOODLE_URL ?? "https://ujian.smpn29jkt.sch.id";
  }

  public getQuizEmbedUrl(quizId: number): string {
    return `${this.baseUrl}/mod/quiz/view.php?id=${quizId}`;
  }

  public async validateQuizAvailability(quizId: number): Promise<boolean> {
    try {
      const res = await fetch(
        `${this.baseUrl}/mod/quiz/view.php?id=${quizId}`,
        {
          method: "HEAD",
          cache: "no-store",
        },
      );
      return res.ok;
    } catch {
      return true;
    }
  }
}
