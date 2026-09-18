//Files: src/lib/hmac.ts

import crypto from "node:crypto";

export interface GenerateLaunchTokenParams {
    quizId: number;
    userId: number;
    timestamp?: number;
    secret?: string;
}

export interface VerifyLaunchTokenParams {
    quizId: number;
    userId: number;
    timestamp: number;
    token: string;
    secret?: string;
    toleranceSeconds?: number;
}

/**
 * Menghasilkan token HMAC SHA-256 untuk meluncurkan kuis ke Moodle rule.php
 */
export function generateLaunchToken({
                                        quizId,
                                        userId,
                                        timestamp = Math.floor(Date.now() / 1000),
                                        secret = process.env.MOODLE_SHARED_SECRET || "",
                                    }: GenerateLaunchTokenParams): { token: string; timestamp: number } {
    if (!secret) {
        throw new Error("MOODLE_SHARED_SECRET belum dikonfigurasi.");
    }

    const payload = `${quizId}:${userId}:${timestamp}`;
    const token = crypto.createHmac("sha256", secret).update(payload).digest("hex");

    return { token, timestamp };
}

/**
 * Memvalidasi token HMAC SHA-256 yang diterima dari request query/callback
 */
export function verifyLaunchToken({
                                      quizId,
                                      userId,
                                      timestamp,
                                      token,
                                      secret = process.env.MOODLE_SHARED_SECRET || "",
                                      toleranceSeconds = 60,
                                  }: VerifyLaunchTokenParams): boolean {
    if (!secret || !token) {
        return false;
    }

    // Cek masa berlaku timestamp (default batas toleransi 60 detik)
    const currentTimestamp = Math.floor(Date.now() / 1000);
    if (Math.abs(currentTimestamp - timestamp) > toleranceSeconds) {
        return false;
    }

    const expectedPayload = `${quizId}:${userId}:${timestamp}`;
    const expectedToken = crypto.createHmac("sha256", secret).update(expectedPayload).digest("hex");

    // Gunakan timingSafeEqual untuk menghindari serangan timing attack
    const expectedBuffer = Buffer.from(expectedToken, "hex");
    const actualBuffer = Buffer.from(token, "hex");

    if (expectedBuffer.length !== actualBuffer.length) {
        return false;
    }

    return crypto.timingSafeEqual(expectedBuffer, actualBuffer);
}