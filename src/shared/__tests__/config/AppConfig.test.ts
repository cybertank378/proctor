// src/shared/config/__tests__/AppConfig.test.ts
import {afterEach, beforeEach, describe, expect, it} from "vitest";
import {AppConfig} from "@/shared/config/AppConfig";

describe("AppConfig (Shared Configuration Suite)", () => {
    const originalEnv = { ...process.env };

    beforeEach(() => {
        // Reset cache singleton sebelum setiap pengujian
        AppConfig.reset();
    });

    afterEach(() => {
        // Kembalikan environment variable ke kondisi awal
        process.env = { ...originalEnv };
    });

    describe("Positive Cases", () => {
        it("harus menyediakan nilai default yang valid jika environment variable tidak diisi (AAA Pattern)", () => {
            // Arrange
            const mutableEnv = process.env as Record<string, string | undefined>;
            delete mutableEnv.JWT_SECRET;
            delete mutableEnv.DEFAULT_MAX_VIOLATIONS;
            delete mutableEnv.CHAT_RETENTION_DAYS;

            // Act
            const config = AppConfig.get();

            // Assert
            expect(config.defaultMaxViolations).toBe(3);
            expect(config.chatRetentionDays).toBe(90);
            expect(config.jwtSecret.length).toBeGreaterThanOrEqual(32);
        });

        it("harus membaca nilai kustom dari environment variable saat disediakan (AAA Pattern)", () => {
            // Arrange
            process.env.DEFAULT_MAX_VIOLATIONS = "5";
            process.env.CHAT_RETENTION_DAYS = "30";
            process.env.MOODLE_WS_TOKEN = "custom-moodle-token-123";

            // Act
            const config = AppConfig.get();

            // Assert
            expect(config.defaultMaxViolations).toBe(5);
            expect(config.chatRetentionDays).toBe(30);
            expect(config.moodleWsToken).toBe("custom-moodle-token-123");
        });
    });

    describe("Negative & Edge Cases", () => {
        it("harus melempar error pada environment production jika JWT_SECRET kurang dari 32 karakter (AAA Pattern)", () => {
            // Arrange
            const mutableEnv = process.env as Record<string, string | undefined>;
            mutableEnv.NODE_ENV = "production";
            mutableEnv.JWT_SECRET = "too-short";

            // Act & Assert
            expect(() => AppConfig.get()).toThrow(
                "Konfigurasi JWT_SECRET wajib diisi minimal 32 karakter pada environment production."
            );
        });

        it("harus fallback ke nilai default jika DEFAULT_MAX_VIOLATIONS bernilai <= 0 (AAA Pattern)", () => {
            // Arrange
            process.env.DEFAULT_MAX_VIOLATIONS = "-10";

            // Act
            const config = AppConfig.get();

            // Assert
            expect(config.defaultMaxViolations).toBe(3);
        });
    });
});