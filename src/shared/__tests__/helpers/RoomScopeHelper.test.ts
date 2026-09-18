//Files: src/shared/__tests__/helpers/RoomScopeHelper.test.ts
import {describe, expect, it} from "vitest";
import {RoomScopeHelper} from "@/shared/helpers/RoomScopeHelper";

describe("RoomScopeHelper (Shared Helper Suite)", () => {
    describe("canManageTargetRoom", () => {
        describe("Positive Cases", () => {
            it("harus mengizinkan CHIEF_PROCTOR mengelola ruangan mana saja (AAA Pattern)", () => {
                // Arrange, Act & Assert
                expect(RoomScopeHelper.canManageTargetRoom("CHIEF_PROCTOR", null, "Lab 1")).toBe(true);
                expect(RoomScopeHelper.canManageTargetRoom("CHIEF_PROCTOR", "Lab 2", "Lab 1")).toBe(true);
                expect(RoomScopeHelper.canManageTargetRoom("CHIEF_PROCTOR", null, null)).toBe(true);
            });

            it("harus mengizinkan PROCTOR ke ruangan penugasannya secara case-insensitive dan trimmed (AAA Pattern)", () => {
                // Arrange
                const assigned = "  Lab Komputer 01  ";
                const target = "lab komputer 01";

                // Act
                const canAccess = RoomScopeHelper.canManageTargetRoom("PROCTOR", assigned, target);

                // Assert
                expect(canAccess).toBe(true);
            });
        });

        describe("Negative Cases", () => {
            it("harus menolak PROCTOR jika nomor ruangan berbeda (AAA Pattern)", () => {
                // Arrange & Act
                const canAccess = RoomScopeHelper.canManageTargetRoom("PROCTOR", "Lab 1", "Lab 2");

                // Assert
                expect(canAccess).toBe(false);
            });

            it("harus menolak PROCTOR jika assignedRoom atau targetRoom bernilai null atau string kosong (AAA Pattern)", () => {
                // Arrange, Act & Assert
                expect(RoomScopeHelper.canManageTargetRoom("PROCTOR", null, "Lab 1")).toBe(false);
                expect(RoomScopeHelper.canManageTargetRoom("PROCTOR", "Lab 1", null)).toBe(false);
                expect(RoomScopeHelper.canManageTargetRoom("PROCTOR", "   ", "Lab 1")).toBe(false);
                expect(RoomScopeHelper.canManageTargetRoom("PROCTOR", "Lab 1", "   ")).toBe(false);
            });
        });
    });

    describe("resolveFilterRoom", () => {
        it("harus menggunakan filter permintaan bebas bagi CHIEF_PROCTOR (AAA Pattern)", () => {
            // Arrange & Act
            const resolved = RoomScopeHelper.resolveFilterRoom("CHIEF_PROCTOR", null, "Lab 3");

            // Assert
            expect(resolved).toBe("Lab 3");
        });

        it("harus mengunci filter sesuai penugasan pengawas untuk role PROCTOR (AAA Pattern)", () => {
            // Arrange & Act
            const resolved = RoomScopeHelper.resolveFilterRoom("PROCTOR", "Lab 1", "Lab 3");

            // Assert
            expect(resolved).toBe("Lab 1");
        });
    });
});