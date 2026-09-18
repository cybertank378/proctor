//Files: src/__tests__/proxy.test.ts
import {describe, expect, it} from "vitest";
import {NextRequest} from "next/server";
import proxy from "../proxy";

describe("Next.js 16 Proxy Gateway Suite", () => {
    describe("Positive Cases", () => {
        it("harus meloloskan rute publik seperti /login tanpa perlu otentikasi (AAA Pattern)", async () => {
            // Arrange
            const request = new NextRequest("http://localhost:3000/login");

            // Act
            const response = await proxy(request);

            // Assert
            expect(response.status).toBe(200);
            expect(response.headers.get("location")).toBeNull();
        });

        it("harus mengizinkan akses ke halaman protected jika cookie otentikasi tersedia (AAA Pattern)", async () => {
            // Arrange
            const request = new NextRequest("http://localhost:3000/monitoring", {
                headers: {
                    cookie: "proctor_access_token=valid-session-jwt-token",
                },
            });

            // Act
            const response = await proxy(request);

            // Assert
            expect(response.status).toBe(200);
            expect(response.headers.get("location")).toBeNull();
        });

        it("harus mengizinkan API request jika header Bearer token valid disediakan (AAA Pattern)", async () => {
            // Arrange
            const request = new NextRequest("http://localhost:3000/api/monitoring/attempts?quizId=10", {
                headers: {
                    authorization: "Bearer valid-session-jwt-token",
                },
            });

            // Act
            const response = await proxy(request);

            // Assert
            expect(response.status).toBe(200);
            expect(response.headers.get("location")).toBeNull();
        });
    });

    describe("Negative Cases", () => {
        it("harus me-redirect ke /login jika mengakses halaman protected tanpa token (AAA Pattern)", async () => {
            // Arrange
            const request = new NextRequest("http://localhost:3000/monitoring");

            // Act
            const response = await proxy(request);

            // Assert
            expect(response.status).toBe(307);
            expect(response.headers.get("location")).toContain("/login?redirect=%2Fmonitoring");
        });

        it("harus mengembalikan JSON 401 saat endpoint API dipanggil tanpa token (AAA Pattern)", async () => {
            // Arrange
            const request = new NextRequest("http://localhost:3000/api/monitoring/attempts?quizId=10");

            // Act
            const response = await proxy(request);
            const json = await response.json();

            // Assert
            expect(response.status).toBe(401);
            expect(json.success).toBe(false);
            expect(json.error).toContain("Unauthorized");
        });

        it("harus menolak request jika bearer token berupa string literal 'null' (AAA Pattern)", async () => {
            // Arrange
            const request = new NextRequest("http://localhost:3000/api/chat/messages?quizId=10", {
                headers: {
                    authorization: "Bearer null",
                },
            });

            // Act
            const response = await proxy(request);

            // Assert
            expect(response.status).toBe(401);
        });
    });
});