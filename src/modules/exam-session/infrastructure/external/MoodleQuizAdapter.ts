// Files: src/modules/exam-session/infrastructure/external/MoodleQuizAdapter.ts

import type { MoodleQuizAdapterContract } from "../../domain/contract/MoodleQuizAdapterContract";

export class MoodleQuizAdapter implements MoodleQuizAdapterContract {
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl =
      process.env.NEXT_PUBLIC_MOODLE_URL ?? "https://ujian.smpn29jkt.sch.id";
  }

  public getQuizEmbedUrl(
    quizId: number,
    cmid?: number,
    userId?: number,
    signature?: string,
  ): string {
    if (userId && signature) {
      const cmidParam = cmid && cmid > 0 ? `&cmid=${cmid}` : "";
      return `${this.baseUrl}/mod/quiz/accessrule/guard/launch.php?quizid=${quizId}${cmidParam}&uid=${userId}&sig=${signature}`;
    }
    if (cmid && cmid > 0) {
      return `${this.baseUrl}/mod/quiz/view.php?id=${cmid}`;
    }
    return `${this.baseUrl}/mod/quiz/view.php?q=${quizId}`;
  }

  public async validateQuizAvailability(quizId: number): Promise<boolean> {
    try {
      const res = await fetch(
        `${this.baseUrl}/mod/quiz/view.php?q=${quizId}`,
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
