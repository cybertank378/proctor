//Files: src/sections/violations/pages/ViolationAuditSection.tsx
import type React from "react";
import {ViolationListTableView} from "@/sections/violations/organisms/ViolationListTableView";

export const ViolationAuditSection: React.FC = () => {
    return (
        <div className="min-h-dvh bg-slate-50/50 px-6 py-8 lg:px-12">
            <header className="mb-8">
                <h1 className="text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">
                    Audit Bukti Pelanggaran Ujian
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                    Telusuri berkas snapshot kecurangan siswa dan verifikasi keaslian bukti digital menggunakan SHA-256 Anti-Tamper Checksum.
                </p>
            </header>

            <ViolationListTableView />
        </div>
    );
};