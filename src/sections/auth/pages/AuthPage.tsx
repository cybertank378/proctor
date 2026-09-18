//Files: src/sections/auth/pages/AuthPage.tsx
"use client";

import type React from "react";
import LoginFormSection from "../organisms/LoginFormSection";

export type AuthMode = "login";

interface AuthPageProps {
    readonly mode?: AuthMode;
}

export default function AuthPage({ mode = "login" }: AuthPageProps) {
    const resolveComponent = (): React.ReactNode => {
        switch (mode) {
            case "login":
                return <LoginFormSection />;
            default:
                return <LoginFormSection />;
        }
    };

    return <main className="min-h-screen bg-slate-50">{resolveComponent()}</main>;
}