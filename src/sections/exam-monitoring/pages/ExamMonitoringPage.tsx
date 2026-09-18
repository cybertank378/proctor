//Files: src/sections/exam-monitoring/pages/ExamMonitoringPage.tsx
import type React from "react";
import {ExamMonitoringTableView} from "@/sections/exam-monitoring/organisms/ExamMonitoringTableView";

export const ExamMonitoringPage: React.FC = () => {
    return (
        <div className="min-h-dvh bg-slate-50/50 px-6 py-8 lg:px-12">
            <header className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">
                        Dashboard Pemantauan Ujian
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Pantau aktivitas pengerjaan kuis siswa secara real-time dan kelola pembukaan blokir Moodle QuizAccess Guard.
                    </p>
                </div>
            </header>

            <ExamMonitoringTableView />
        </div>
    );
};