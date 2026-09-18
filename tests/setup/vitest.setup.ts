// tests/setup/vitest.setup.ts

import { afterAll, afterEach, beforeAll, vi } from "vitest";

// 1. Inisialisasi mock environment variables default (Aman dari TS2540)
beforeAll(() => {
    (process.env as Record<string, string | undefined>).NODE_ENV = "test";
    process.env.MOODLE_URL = "https://moodle.test.local";
    process.env.MOODLE_WS_TOKEN = "mock-token-test-12345";
    process.env.MOODLE_SHARED_SECRET = "mock-shared-secret-key-67890";
    process.env.DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/exam_guard_test";
    process.env.MAX_ALLOWED_VIOLATIONS = "3";
});

// 2. Mocking Global Fetch untuk pengujian Moodle REST API & Internal Proxy
const originalFetch = globalThis.fetch;

beforeAll(() => {
    globalThis.fetch = vi.fn().mockImplementation(() =>
        Promise.resolve(
            new Response(JSON.stringify({ status: true, message: "Mocked Response" }), {
                status: 200,
                headers: { "Content-Type": "application/json" },
            })
        )
    );
});

// 3. Mocking Browser DOM APIs
if (typeof window !== "undefined") {
    // Mocking Fullscreen API
    Object.defineProperty(document, "fullscreenElement", {
        configurable: true,
        writable: true,
        value: null,
    });

    document.documentElement.requestFullscreen = vi.fn().mockResolvedValue(undefined);
    document.exitFullscreen = vi.fn().mockResolvedValue(undefined);

    // Mocking MediaDevices API
    Object.defineProperty(navigator, "mediaDevices", {
        configurable: true,
        writable: true,
        value: {
            getUserMedia: vi.fn().mockResolvedValue({
                getTracks: () => [{ stop: vi.fn() }],
            }),
            getDisplayMedia: vi.fn().mockResolvedValue({
                getTracks: () => [{ stop: vi.fn() }],
            }),
        },
    });

    // Mocking EventSource tanpa unused-fields error
    class MockEventSource {
        public readonly url: string;
        public onmessage: ((event: MessageEvent) => void) | null = null;
        public onerror: ((event: Event) => void) | null = null;

        constructor(url: string) {
            this.url = url;
        }

        public close(): void {
            // Mock close implementation
        }

        public addEventListener(_type: string, _listener: EventListenerOrEventListenerObject): void {
            // Mock addEventListener implementation
        }

        public removeEventListener(_type: string, _listener: EventListenerOrEventListenerObject): void {
            // Mock removeEventListener implementation
        }
    }

    Object.defineProperty(globalThis, "EventSource", {
        configurable: true,
        writable: true,
        value: MockEventSource,
    });
}

// 4. Reset & Cleanup setelah setiap skenario pengujian
afterEach(() => {
    vi.clearAllMocks();
});

// 5. Kembalikan kondisi fetch asli setelah seluruh suite selesai
afterAll(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
});