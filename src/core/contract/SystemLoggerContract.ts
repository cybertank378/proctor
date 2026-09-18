//Files: src/core/contract/SystemLoggerContract.ts
export type LogContext = Record<string, unknown>;

export interface SystemLoggerContract {
  /**
   * Mencatat pesan informasional audit standar sistem
   */
  info(message: string, context?: LogContext): void;

  /**
   * Mencatat indikasi peringatan atau pelanggaran batas toleransi
   */
  warn(message: string, context?: LogContext): void;

  /**
   * Mencatat kegagalan sistem, galat jaringan Web Service, atau mismatch integritas
   */
  error(message: string, error?: unknown, context?: LogContext): void;
}
