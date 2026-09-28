//Files: src/shared/config/AppConfig.ts
export interface IAppConfig {
  readonly appEnv: "development" | "production" | "test";
  readonly jwtSecret: string;
  readonly moodleWsToken: string;
  readonly moodleWsUrl: string;
  readonly defaultMaxViolations: number;
  readonly chatRetentionDays: number;
}

export class AppConfig {
  private static cachedConfig: IAppConfig | null = null;

  public static get(): IAppConfig {
    if (AppConfig.cachedConfig) {
      return AppConfig.cachedConfig;
    }

    const appEnv = (process.env.NODE_ENV ||
      "development") as IAppConfig["appEnv"];
    const jwtSecret = process.env.JWT_SECRET || "";

    if (appEnv === "production" && jwtSecret.trim().length < 32) {
      throw new Error(
        "Konfigurasi JWT_SECRET wajib diisi minimal 32 karakter pada environment production.",
      );
    }

    const defaultMaxViolationsRaw = Number(process.env.DEFAULT_MAX_VIOLATIONS);
    const defaultMaxViolations =
      Number.isInteger(defaultMaxViolationsRaw) && defaultMaxViolationsRaw > 0
        ? defaultMaxViolationsRaw
        : 3;

    const chatRetentionDaysRaw = Number(process.env.CHAT_RETENTION_DAYS);
    const chatRetentionDays =
      Number.isInteger(chatRetentionDaysRaw) && chatRetentionDaysRaw > 0
        ? chatRetentionDaysRaw
        : 90;

    AppConfig.cachedConfig = {
      appEnv,
      jwtSecret: jwtSecret || "dev-default-secret-key-at-least-32-chars-long!",
      moodleWsToken: process.env.MOODLE_WS_TOKEN || "",
      moodleWsUrl:
        process.env.MOODLE_WS_URL ||
        "http://localhost/moodle/webservice/rest/server.php",
      defaultMaxViolations,
      chatRetentionDays,
    };

    return AppConfig.cachedConfig;
  }

  public static reset(): void {
    AppConfig.cachedConfig = null;
  }
}
