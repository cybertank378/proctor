//Files: src/shared/utils/Sha256Checksum.ts
import crypto from "node:crypto";
import {CryptoHashContract} from "@/shared/contract/CryptoHashContract";

export class Sha256Checksum implements CryptoHashContract {
    public computeSha256(data: Buffer | Uint8Array | string): string {
        return crypto.createHash("sha256").update(data).digest("hex");
    }

    public verifySha256(
        data: Buffer | Uint8Array | string,
        expectedHash: string
    ): boolean {
        const normalizedExpected = expectedHash.trim().toLowerCase();

        if (normalizedExpected.length !== 64 || !/^[a-f0-9]{64}$/.test(normalizedExpected)) {
            return false;
        }

        const calculatedHash = this.computeSha256(data);

        const calculatedBuffer = Buffer.from(calculatedHash, "utf8");
        const expectedBuffer = Buffer.from(normalizedExpected, "utf8");

        if (calculatedBuffer.length !== expectedBuffer.length) {
            return false;
        }

        return crypto.timingSafeEqual(calculatedBuffer, expectedBuffer);
    }
}