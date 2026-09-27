// src/app/(protected)/monitoring/page.tsx
import { ShieldCheck } from "lucide-react";
import { UnifiedProctorCockpit } from "@/sections/dashboard/organisms/UnifiedProctorCockpit";

export default function MonitoringCockpitPage() {
  return (
    <div className="flex h-screen w-full flex-col overflow-y-auto lg:overflow-hidden bg-slate-100">
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="flex size-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <h1 className="text-xs sm:text-sm font-extrabold tracking-tight text-slate-950 truncate">
            Exam Guard &mdash; Pusat Komando Pengawas
          </h1>
        </div>
        <div className="flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 shrink-0">
          <ShieldCheck className="size-3.5" />
          <span className="hidden sm:inline">Moodle Guard WebService</span>{" "}
          Active
        </div>
      </header>

      {/* Main Container dengan padding proporsional */}
      <main className="flex-1 min-h-0 p-2.5 sm:p-3 overflow-visible lg:overflow-hidden">
        <UnifiedProctorCockpit />
      </main>
    </div>
  );
}
