//Files: src/modules/proctor-chat/domain/domain/policy/ChatRetentionPolicy.ts
export class ChatRetentionPolicy {
  public static calculateCutoffDate(
    retentionDays: number,
    referenceDate: Date = new Date(),
  ): Date {
    const days = Math.max(1, retentionDays);
    const millisecondsInDay = 24 * 60 * 60 * 1000;
    return new Date(referenceDate.getTime() - days * millisecondsInDay);
  }

  public static isExpired(messageDate: Date, cutoffDate: Date): boolean {
    return messageDate.getTime() < cutoffDate.getTime();
  }
}
