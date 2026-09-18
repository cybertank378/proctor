// Files: vitest.config.mts

import {existsSync, readdirSync} from "node:fs";
import {dirname, join, resolve} from "node:path";
import {fileURLToPath} from "node:url";

import {defineConfig} from "vitest/config";

const projectRoot = dirname(fileURLToPath(import.meta.url));

const modulesDirectory = resolve(projectRoot, "src/modules");

function getTestedModules(): string[] {
    if (!existsSync(modulesDirectory)) {
        return [];
    }

    return readdirSync(modulesDirectory, {
        withFileTypes: true,
    })
        .filter((entry) => {
            if (!entry.isDirectory()) {
                return false;
            }

            return existsSync(join(modulesDirectory, entry.name, "__tests__"));
        })
        .map((entry) => entry.name)
        .sort();
}

const testedModules = getTestedModules();

const coverageInclude =
    testedModules.length > 0
        ? testedModules.flatMap((moduleName) => [
            `src/modules/${moduleName}/**/*.ts`,
            `src/modules/${moduleName}/**/*.tsx`,
        ])
        : ["src/modules/__no_test_modules__/**/*.ts"];

export default defineConfig({
    resolve: {
        tsconfigPaths: true,
    },

    test: {
        environment: "node",

        globals: false,

        setupFiles: ["./tests/setup/vitest.setup.ts"],

        include: [
            "src/__tests__/*.test.ts",
            "src/core/**/__tests__/**/*.test.ts",
            "src/modules/**/__tests__/**/*.test.ts",
            "src/modules/**/__tests__/**/*.spec.ts",
            "src/modules/**/__tests__/**/*.test.tsx",
            "src/modules/**/__tests__/**/*.spec.tsx",
            "src/sections/**/__tests__/**/*.test.ts",
            "src/sections/**/__tests__/**/*.spec.ts",
            "src/sections/**/__tests__/**/*.test.tsx",
            "src/sections/**/__tests__/**/*.spec.tsx",
            "src/shared/**/__tests__/**/*.test.ts"
        ],

        exclude: [
            "**/node_modules/**",
            "**/.next/**",
            "**/dist/**",
            "**/build/**",
            "**/coverage/**",
            "**/src/generated/**",
        ],

        clearMocks: true,

        restoreMocks: true,

        unstubEnvs: true,

        unstubGlobals: true,

        passWithNoTests: false,

        testTimeout: 10_000,

        hookTimeout: 10_000,

        coverage: {
            provider: "v8",

            reportsDirectory: "./coverage",

            reporter: ["text", "html", "lcov", "json-summary"],

            include: coverageInclude,

            exclude: [
                "src/modules/**/__tests__/**",
                "src/modules/**/dto/**",
                "src/modules/**/interfaces/**",
                "src/modules/**/*.d.ts",
                "src/generated/**",
            ],

            thresholds: {
                branches: 90,
                functions: 90,
                lines: 90,
                statements: 90,
            },
        },
    },
});