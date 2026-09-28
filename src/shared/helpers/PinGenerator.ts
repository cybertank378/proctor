import crypto from "crypto";
import { AppConfig } from "@/shared/config/AppConfig";

export class PinGenerator {
  /**
   * Menghasilkan 6-digit PIN acak tapi deterministik
   * berdasarkan attemptId dan secret key dari env.
   */
  public static generateForAttempt(attemptId: number, quizId: number): string {
    const secret = AppConfig.get().jwtSecret;
    const hash = crypto
      .createHmac("sha256", secret)
      .update(`${quizId}:${attemptId}`)
      .digest("hex");

    // Ambil 6 karakter pertama hex, ubah ke integer, dan limit 6 digit
    const num = parseInt(hash.substring(0, 6), 16);
    const pin = (num % 1000000).toString().padStart(6, "0");
    return pin;
  }
}
