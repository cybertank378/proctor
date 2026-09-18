//Files: src/modules/auth/__tests__/domain/Entity.test.ts
import {describe, expect, it} from "vitest";
import {ProctorSessionEntity} from "../../domain/entity/ProctorSessionEntity";
import {ProctorUserEntity} from "../../domain/entity/ProctorUserEntity";

describe("Domain Entities Suite", () => {
    const baseUserProps = {
        id: "proctor-uuid-1",
        moodleUserId: 101,
        username: "proctor_lab1",
        passwordHash: "$argon2id$v=19$m=65536,t=3,p=1$mockhash",
        fullName: "Ahmad Dahlan",
        role: "PROCTOR" as const,
        roomNumber: "Lab Komputer 1",
        isActive: true,
        createdAt: new Date("2026-09-17T00:00:00.000Z"),
        updatedAt: new Date("2026-09-17T00:00:00.000Z"),
    };

    describe("ProctorUserEntity", () => {
        it("harus membuat instance entitas valid saat data lengkap (AAA Pattern)", () => {
            // Arrange & Act
            const user = new ProctorUserEntity(baseUserProps);

            // Assert
            expect(user.id).toBe("proctor-uuid-1");
            expect(user.username).toBe("proctor_lab1");
            expect(user.isChiefProctor()).toBe(false);
            expect(user.canAccessRoom("Lab Komputer 1")).toBe(true);
        });

        it("harus mengizinkan akses ke semua ruangan bagi CHIEF_PROCTOR (AAA Pattern)", () => {
            // Arrange
            const chief = new ProctorUserEntity({
                ...baseUserProps,
                role: "CHIEF_PROCTOR",
                roomNumber: null,
            });

            // Act & Assert
            expect(chief.canAccessRoom("Ruang 204")).toBe(true);
            expect(chief.canAccessRoom("Lab Utama")).toBe(true);
        });

        it("harus menolak PROCTOR mengakses ruangan lain (AAA Pattern)", () => {
            // Arrange
            const user = new ProctorUserEntity(baseUserProps);

            // Act & Assert
            expect(user.canAccessRoom("Lab Komputer 2")).toBe(false);
        });

        it("harus melempar error invariant jika username kosong (AAA Pattern)", () => {
            // Arrange, Act & Assert
            expect(() => new ProctorUserEntity({ ...baseUserProps, username: "   " })).toThrow(
                "Username pengawas tidak boleh kosong."
            );
        });

        it("harus melempar error invariant jika passwordHash kosong (AAA Pattern)", () => {
            // Arrange, Act & Assert
            expect(() => new ProctorUserEntity({ ...baseUserProps, passwordHash: "" })).toThrow(
                "Password hash pengawas tidak boleh kosong."
            );
        });
    });

    describe("ProctorSessionEntity", () => {
        const futureDate = new Date("2026-09-17T08:00:00.000Z");
        const pastDate = new Date("2026-09-16T08:00:00.000Z");
        const referenceNow = new Date("2026-09-17T00:00:00.000Z");

        it("harus memvalidasi sesi aktif dengan benar (AAA Pattern)", () => {
            // Arrange
            const session = new ProctorSessionEntity({
                id: "sess-1",
                token: "opaque-token-1",
                proctorId: "proctor-uuid-1",
                expiresAt: futureDate,
                createdAt: referenceNow,
            });

            // Act & Assert
            expect(session.isValid(referenceNow)).toBe(true);
            expect(session.isExpired(referenceNow)).toBe(false);
            expect(session.belongsTo("proctor-uuid-1")).toBe(true);
        });

        it("harus menandai sesi kedaluwarsa jika waktu acuan melampaui expiresAt (AAA Pattern)", () => {
            // Arrange
            const session = new ProctorSessionEntity({
                id: "sess-2",
                token: "opaque-token-2",
                proctorId: "proctor-uuid-1",
                expiresAt: pastDate,
                createdAt: new Date("2026-09-15T00:00:00.000Z"),
            });

            // Act & Assert
            expect(session.isValid(referenceNow)).toBe(false);
            expect(session.isExpired(referenceNow)).toBe(true);
            expect(session.belongsTo("proctor-uuid-2")).toBe(false);
        });

        it("harus melempar error invariant jika properti wajib sesi kosong (AAA Pattern)", () => {
            // Arrange, Act & Assert
            expect(
                () =>
                    new ProctorSessionEntity({
                        id: "",
                        token: "tok",
                        proctorId: "pid",
                        expiresAt: futureDate,
                        createdAt: referenceNow,
                    })
            ).toThrow("ID sesi tidak boleh kosong.");
        });
    });
});