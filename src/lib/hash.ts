//Files: src/lib/hash.ts
import crypto from "node:crypto";

/**
 * Menghitung checksum SHA-256 dari Buffer atau string berkas bukti untuk menjamin audit anti-tamper.
 */
export function computeSha256(data: Buffer | Uint8Array | string): string {
  const hash = crypto.createHash("sha256");

  if (typeof data === "string") {
    hash.update(data, "utf8");
  } else {
    hash.update(data);
  }

  return hash.digest("hex");
}

/**
 * Memvalidasi apakah data yang diberikan cocok dengan hash SHA-256 yang tercatat di database.
 */
export function verifySha256(
  data: Buffer | Uint8Array | string,
  expectedHash: string,
): boolean {
  const actualHash = computeSha256(data);
  const actualBuffer = Buffer.from(actualHash, "utf8");
  const expectedBuffer = Buffer.from(expectedHash, "utf8");

  if (actualBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(actualBuffer, expectedBuffer);
}
