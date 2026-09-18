// Files: src/sections/landing/layout/LandingShell.tsx
import type {ReactNode} from "react";
import {Radio, ShieldCheck} from "lucide-react";

interface LandingShellProps {
    children: ReactNode;
}

export function LandingShell({children}: LandingShellProps) {
    return (<div
            className="flex min-h-screen w-full flex-col bg-slate-950 font-sans text-slate-100 antialiased selection:bg-blue-600 selection:text-white">
            {/* Top Navbar */}
            <header
                className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-slate-800 bg-slate-900/60 px-6 backdrop-blur-md">
                <div className="flex items-center gap-3">
                    <div
                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-600/10 text-blue-500 shadow-inner">
                        <ShieldCheck className="h-5 w-5"/>
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span
                                className="text-sm font-bold tracking-tight text-white">Exam Guard Control Center</span>
                            <span
                                className="rounded-full border border-blue-500/30 bg-blue-500/10 px-2 py-0.5 text-[10px] font-semibold text-blue-400">
                Proctor Mode
              </span>
                        </div>
                        <p className="text-[11px] text-slate-400">Automated Cheating Detection & Realtime Proctoring</p>
                    </div>
                </div>

                {/* Live Indicator */}
                <div
                    className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[11px] font-medium text-emerald-400">
                    <Radio className="h-3.5 w-3.5 animate-pulse"/>
                    <span>Realtime Feed Active</span>
                </div>
            </header>

            {/* Main Content Area */}
            <div className="flex-1 w-full">{children}</div>
        </div>);
}