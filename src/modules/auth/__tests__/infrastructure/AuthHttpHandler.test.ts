//Files: src/modules/auth/__tests__/infrastructure/AuthHttpHandler.test.ts
import {describe, expect, it, vi} from "vitest";
import {AppResultFactory} from "@/core/application/result/AppResultFactory";
import type {HttpRequest} from "@/core/infrastructure/http/HttpRequest";
import {AuthHttpHandler} from "../../infrastructure/http/AuthHttpHandler";

describe("AuthHttpHandler (HTTP Presentation Adapter)", () => {
    const mockLoginUseCase = { execute: vi.fn() };
    const mockLogoutUseCase = { execute: vi.fn() };
    const mockGetSessionUseCase = { execute: vi.fn() };

    const handler = new AuthHttpHandler(
        mockLoginUseCase as any,
        mockLogoutUseCase as any,
        mockGetSessionUseCase as any
    );

    it("harus merespons HTTP 200 saat login berhasil (AAA Pattern)", async () => {
        // Arrange
        vi.spyOn(mockLoginUseCase, "execute").mockResolvedValue(
            AppResultFactory.success({ accessToken: "token-abc" }, "Sukses")
        );

        const req: HttpRequest = {
            headers: new Headers(),
            url: "http://localhost/api/auth/login",
            method: "POST",
            body: { username: "proctor", password: "pwd" },
        };

        // Act
        const res = await handler.handle(req);
        const body = await res.json();

        // Assert
        expect(res.status).toBe(200);
        expect(body.data.accessToken).toBe("token-abc");
    });

    it("harus merespons HTTP 401 saat Bearer token hilang pada current session (AAA Pattern)", async () => {
        // Arrange
        const req: HttpRequest = {
            headers: new Headers(),
            url: "http://localhost/api/auth/current-session",
            method: "GET",
        };

        // Act
        const res = await handler.handle(req);

        // Assert
        expect(res.status).toBe(401);
    });
});