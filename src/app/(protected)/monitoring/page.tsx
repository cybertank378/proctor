//Files: src/app/(protected)/monitoring/page.tsx
import {ShieldCheck} from "lucide-react";
import {UnifiedProctorCockpit} from "@/sections/dashboard/organisms/UnifiedProctorCockpit";

export default function MonitoringCockpitPage() {
    return (
        <div className="flex h-screen w-screen flex-col overflow-hidden bg-slate-100">
            {/* Top Header Bar */}
            <header className="flex h-12 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-5 shadow-xs">
                <div className="flex items-center gap-2.5">
                    <span className="flex size-2 rounded-full bg-emerald-500 animate-pulse" />
                    <h1 className="text-sm font-extrabold tracking-tight text-slate-950">
                        Exam Guard &mdash; Pusat Komando Pengawas
                    </h1>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    <ShieldCheck className="size-3.5" />
                    Moodle Guard WebService Active
                </div>
            </header>

            {/* Main Cockpit Container */}
            <main className="flex-1 overflow-hidden p-3">
                <UnifiedProctorCockpit />
            </main>
        </div>
    );
}