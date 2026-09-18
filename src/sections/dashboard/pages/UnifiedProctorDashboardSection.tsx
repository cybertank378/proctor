//Files: src/sections/dashboard/pages/UnifiedProctorDashboardSection.tsx
"use client";

import type React from "react";
import {ShieldCheck} from "lucide-react";
import {UnifiedProctorCockpit} from "../organisms/UnifiedProctorCockpit";

export default function UnifiedProctorDashboardSection(): React.JSX.Element {
    return (
        <div className="flex h-screen w-full flex-col overflow-hidden bg-slate-100">
            {/* Top Navbar */}
            <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6">
                <div className="flex items-center gap-3">
                    <span className="flex size-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <h1 className="text-base font-extrabold tracking-tight text-slate-950">
                        Exam Guard &mdash; Pusat Komando Pengawas
                    </h1>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                    <ShieldCheck className="size-3.5" />
                    Moodle Guard WebService Active
                </div>
            </header>

            {/* Main Cockpit Area */}
            <main className="flex-1 overflow-hidden p-4">
                <UnifiedProctorCockpit />
            </main>
        </div>
    );
}