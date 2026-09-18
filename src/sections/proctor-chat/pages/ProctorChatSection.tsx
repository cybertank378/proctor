//Files: src/sections/proctor-chat/pages/ProctorChatSection.tsx
"use client";

import type React from "react";
import {MessageSquareCode, ShieldCheck} from "lucide-react";
import {ProctorChatPanel} from "../organisms/ProctorChatPanel";

export interface ProctorChatSectionProps {
    readonly initialQuizId?: number;
    readonly initialRoomNumber?: string;
    readonly pollIntervalMs?: number;
}

export default function ProctorChatSection({
                                               initialQuizId = 1, initialRoomNumber = "", pollIntervalMs = 5000,
                                           }: ProctorChatSectionProps): React.JSX.Element {
    return (<section
            data-testid="proctor-chat-section"
            className="min-h-dvh bg-slate-50/50 px-4 py-6 sm:px-8 sm:py-8 lg:px-12"
        >
            {/* Header Halaman Koordinasi */}
            <header className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                    <div className="flex items-center gap-2">
                        <h1 className="text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">
                            Saluran Koordinasi Pengawas
                        </h1>
                        <span
                            data-testid="status-indicator-live"
                            className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-600/20"
                        >
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse"/>
              Live Canal
            </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-500">
                        Pusat koordinasi langsung sesama pengawas ruang dan ketua pengawas selama sesi ujian
                        berlangsung.
                    </p>
                </div>

                {/* Info Lencana Integritas Pengawasan */}
                <div
                    className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 shadow-xs sm:self-auto">
                    <ShieldCheck className="size-4.5 text-emerald-600 shrink-0"/>
                    <div className="text-xs">
                        <p className="font-semibold text-slate-800">Exam Guard Network</p>
                        <p className="text-slate-500">Koneksi Terenkripsi Moodle</p>
                    </div>
                </div>
            </header>

            {/* Main Panel Organism */}
            <main className="w-full">
                <ProctorChatPanel
                    defaultQuizId={initialQuizId}
                    defaultRoomNumber={initialRoomNumber}
                    pollIntervalMs={pollIntervalMs}
                />
            </main>

            {/* Footer Protokol Pengawasan */}
            <footer className="mt-4 flex items-center justify-between text-xs text-slate-400">
        <span className="flex items-center gap-1">
          <MessageSquareCode className="size-3.5 text-slate-400"/>
          Seluruh log percakapan tercatat secara otomatis untuk audit kepatuhan ujian.
        </span>
                <span>Auto-prune 90 hari aktif</span>
            </footer>
        </section>);
}