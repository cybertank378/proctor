//Files: src/core/contract/__tests__/SystemLoggerContract.test.ts
import { describe, expect, it } from "vitest";
import type { LogContext, SystemLoggerContract } from "../SystemLoggerContract";

class InMemorySystemLogger implements SystemLoggerContract {
  public readonly infoLogs: Array<{ message: string; context?: LogContext }> =
    [];
  public readonly warnLogs: Array<{ message: string; context?: LogContext }> =
    [];
  public readonly errorLogs: Array<{
    message: string;
    error?: unknown;
    context?: LogContext;
  }> = [];

  public info(message: string, context?: LogContext): void {
    this.infoLogs.push({ message, context });
  }

  public warn(message: string, context?: LogContext): void {
    this.warnLogs.push({ message, context });
  }

  public error(message: string, error?: unknown, context?: LogContext): void {
    this.errorLogs.push({ message, error, context });
  }
}

describe("SystemLoggerContract", () => {
  it("harus mencatat level info beserta metadata konteks audit dengan benar (AAA Pattern)", () => {
    // Arrange
    const logger: SystemLoggerContract = new InMemorySystemLogger();
    const inMemoryLogger = logger as InMemorySystemLogger;
    const logMessage = "Pengawas berhasil melakukan remote unlock Moodle";
    const context: LogContext = {
      quizId: 101,
      userId: 12,
      proctorId: "proctor-uuid-1",
    };

    // Act
    logger.info(logMessage, context);

    // Assert
    expect(inMemoryLogger.infoLogs).toHaveLength(1);
    expect(inMemoryLogger.infoLogs[0]?.message).toBe(logMessage);
    expect(inMemoryLogger.infoLogs[0]?.context).toEqual(context);
  });

  it("harus mencatat level error dengan objek error spesifik dan konteks incident (AAA Pattern)", () => {
    // Arrange
    const logger: SystemLoggerContract = new InMemorySystemLogger();
    const inMemoryLogger = logger as InMemorySystemLogger;
    const logMessage =
      "Integrity check mismatch: hash snapshot bukti tidak valid";
    const exception = new Error("Checksum mismatch SHA-256");
    const context: LogContext = {
      attemptId: 541,
      expectedHash: "hash-a",
      actualHash: "hash-b",
    };

    // Act
    logger.error(logMessage, exception, context);

    // Assert
    expect(inMemoryLogger.errorLogs).toHaveLength(1);
    expect(inMemoryLogger.errorLogs[0]?.message).toBe(logMessage);
    expect(inMemoryLogger.errorLogs[0]?.error).toBe(exception);
    expect(inMemoryLogger.errorLogs[0]?.context).toEqual(context);
  });
});
