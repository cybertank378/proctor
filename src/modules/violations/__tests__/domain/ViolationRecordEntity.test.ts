//Files: src/modules/violations/__tests__/domain/ViolationRecordEntity.test.ts
import {describe, expect, it} from "vitest";
import {ViolationRecordEntity} from "@/modules/violations/domain/entity/ViolationRecordEntity";

describe("ViolationRecordEntity (Domain Entity Suite)", () => {
    const validSha256 = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
    const baseProps = {
        id: "viol-uuid-01",
        attemptRecordId: "att-rec-uuid-101",
        type: "TAB_SWITCH" as const,
        localFilePath: "public/uploads/evidences/att-101-snapshot.jpg",
        fileUrl: "/uploads/evidences/att-101-snapshot.jpg",
        sha256Hash: validSha256,
        metadata: { windowTitle: "ChatGPT - OpenAI", screenResolution: "1920x1080" },
        createdAt: new Date("2026-09-17T00:00:00.000Z"),
    };

    describe("Positive Cases", () => {
        it("harus berhasil instansiasi entitas bukti pelanggaran dengan properti valid (AAA Pattern)", () => {
            // Arrange & Act
            const entity = new ViolationRecordEntity(baseProps);

            // Assert
            expect(entity.id).toBe("viol-uuid-01");
            expect(entity.type).toBe("TAB_SWITCH");
            expect(entity.sha256Hash).toBe(validSha256);
            expect(entity.metadata.windowTitle).toBe("ChatGPT - OpenAI");
        });

        it("harus menormalkan sha256Hash menjadi huruf kecil (lowercase) (AAA Pattern)", () => {
            // Arrange
            const upperCaseHash = validSha256.toUpperCase();

            // Act
            const entity = new ViolationRecordEntity({
                ...baseProps,
                sha256Hash: upperCaseHash,
            });

            // Assert
            expect(entity.sha256Hash).toBe(validSha256.toLowerCase());
        });
    });

    describe("Negative & Invariant Cases", () => {
        it("harus melempar error invariant jika id atau attemptRecordId kosong (AAA Pattern)", () => {
            // Arrange, Act & Assert
            expect(() => new ViolationRecordEntity({ ...baseProps, id: "  " })).toThrow(
                "ID catatan pelanggaran tidak boleh kosong."
            );
            expect(() => new ViolationRecordEntity({ ...baseProps, attemptRecordId: "" })).toThrow(
                "ID attempt pengerjaan tidak boleh kosong."
            );
        });

        it("harus melempar error jika localFilePath atau fileUrl kosong (AAA Pattern)", () => {
            // Arrange, Act & Assert
            expect(() => new ViolationRecordEntity({ ...baseProps, localFilePath: "  " })).toThrow(
                "Lokasi fisik (localFilePath) dan URL bukti file tidak boleh kosong."
            );
        });

        it("harus melempar error jika sha256Hash tidak valid atau panjang bukan 64 karakter (AAA Pattern)", () => {
            // Arrange, Act & Assert
            expect(() => new ViolationRecordEntity({ ...baseProps, sha256Hash: "invalid-hash" })).toThrow(
                "Checksum SHA-256 bukti pelanggaran wajib 64 karakter heksadesimal."
            );
            expect(() => new ViolationRecordEntity({ ...baseProps, sha256Hash: "z".repeat(64) })).toThrow(
                "Checksum SHA-256 bukti pelanggaran wajib 64 karakter heksadesimal."
            );
        });
    });
});