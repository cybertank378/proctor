//Files: src/shared/__tests__/utils/Sha256Checksum.test.ts
import { describe, expect, it } from "vitest";
import { Sha256Checksum } from "@/shared/utils/Sha256Checksum";

describe("Sha256Checksum (Shared Utility Suite)", () => {
  const util = new Sha256Checksum();
  const sampleEvidenceBuffer = Buffer.from("image-snapshot-binary-data-stream");

  describe("Positive Cases", () => {
    it("harus menghasilkan checksum SHA-256 heksadesimal tepat 64 karakter (AAA Pattern)", () => {
      // Arrange & Act
      const hash = util.computeSha256(sampleEvidenceBuffer);

      // Assert
      expect(hash).toHaveLength(64);
      expect(/^[a-f0-9]{64}$/.test(hash)).toBe(true);
    });

    it("harus menghasilkan hash konsisten dari tipe input string maupun buffer (AAA Pattern)", () => {
      // Arrange
      const rawString = "identical-evidence-payload";

      // Act
      const stringHash = util.computeSha256(rawString);
      const bufferHash = util.computeSha256(Buffer.from(rawString, "utf8"));

      // Assert
      expect(stringHash).toBe(bufferHash);
    });

    it("harus mengembalikan true saat memverifikasi hash valid dengan timing-safe comparison (AAA Pattern)", () => {
      // Arrange
      const hash = util.computeSha256(sampleEvidenceBuffer);

      // Act
      const isValid = util.verifySha256(sampleEvidenceBuffer, hash);

      // Assert
      expect(isValid).toBe(true);
    });

    it("harus memvalidasi hash dengan huruf kapital secara toleran/case-insensitive (AAA Pattern)", () => {
      // Arrange
      const hash = util.computeSha256(sampleEvidenceBuffer).toUpperCase();

      // Act
      const isValid = util.verifySha256(sampleEvidenceBuffer, hash);

      // Assert
      expect(isValid).toBe(true);
    });
  });

  describe("Negative & Edge Cases", () => {
    it("harus mendeteksi modifikasi data (tampered payload) dan mengembalikan false (AAA Pattern)", () => {
      // Arrange
      const originalHash = util.computeSha256(sampleEvidenceBuffer);
      const tamperedBuffer = Buffer.from(
        "image-snapshot-binary-data-stream-corrupted",
      );

      // Act
      const isValid = util.verifySha256(tamperedBuffer, originalHash);

      // Assert
      expect(isValid).toBe(false);
    });

    it("harus mengembalikan false jika format expectedHash bukan 64 karakter heksadesimal (AAA Pattern)", () => {
      // Arrange
      const invalidShortHash = "not-a-valid-sha256";
      const nonHexHash = "z".repeat(64);

      // Act & Assert
      expect(util.verifySha256(sampleEvidenceBuffer, invalidShortHash)).toBe(
        false,
      );
      expect(util.verifySha256(sampleEvidenceBuffer, nonHexHash)).toBe(false);
      expect(util.verifySha256(sampleEvidenceBuffer, "")).toBe(false);
    });
  });
});
