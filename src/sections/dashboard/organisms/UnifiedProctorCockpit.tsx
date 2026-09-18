// src/sections/dashboard/organisms/UnifiedProctorCockpit.tsx
"use client";

import type React from "react";
import {useCallback, useEffect, useMemo, useState} from "react";
import {DoorOpen, Hash, MessageSquare, RefreshCw, Search, ShieldAlert, Users,} from "lucide-react";
import {useExamMonitoringApi} from "@/modules/exam-monitoring/presentations/presentations/hook/useExamMonitoringApi";
import {useViolationsApi} from "@/modules/violations/presentations/hook/useViolationsApi";
import {StatusBadge} from "@/sections/exam-monitoring/atoms/StatusBadge";
import {MetricCard} from "@/sections/exam-monitoring/molecules/MetricCard";
import {ProctorChatPanel} from "@/sections/proctor-chat/organisms/ProctorChatPanel";
import {EvidenceCard} from "@/sections/violations/molecules/EvidenceCard";
import {ViolationEvidenceModal} from "@/sections/violations/organisms/ViolationEvidenceModal";
import Button from "@/shared-ui/component/Button";
import Pagination from "@/shared-ui/component/Pagination";
import {Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow,} from "@/shared-ui/component/Table";
import TextField from "@/shared-ui/component/TextField";

const ITEMS_PER_PAGE = 7;

export const UnifiedProctorCockpit: React.FC = () => {
    const {
        loading: monitoringLoading,
        attempts,
        fetchAttempts,
        unlockStudent,
    } = useExamMonitoringApi();

    const {
        loading: violationsLoading,
        violations,
        fetchViolations,
        verifyIntegrity,
    } = useViolationsApi();

    const [quizIdFilter, setQuizIdFilter] = useState<string>("10");
    const [roomFilter, setRoomFilter] = useState<string>("");
    const [currentPage, setCurrentPage] = useState<number>(1);

    const [selectedAttemptRecordId, setSelectedAttemptRecordId] = useState<string | null>(null);
    const [modalAttemptId, setModalAttemptId] = useState<string | null>(null);

    const activeQuizId = useMemo(() => {
        const val = Number(quizIdFilter);
        return Number.isInteger(val) && val > 0 ? val : undefined;
    }, [quizIdFilter]);

    const loadMonitoringData = useCallback(() => {
        fetchAttempts(activeQuizId, roomFilter.trim() || undefined);
    }, [fetchAttempts, activeQuizId, roomFilter]);

    useEffect(() => {
        loadMonitoringData();
    }, [loadMonitoringData]);

    useEffect(() => {
        if (selectedAttemptRecordId) {
            fetchViolations(selectedAttemptRecordId);
        } else if (attempts.length > 0) {
            const firstLocked = attempts.find((a) => a.isLocked) ?? attempts[0];
            if (firstLocked) {
                setSelectedAttemptRecordId(firstLocked.id);
                fetchViolations(firstLocked.id);
            }
        }
    }, [selectedAttemptRecordId, attempts, fetchViolations]);

    const handleFilterSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setCurrentPage(1);
        loadMonitoringData();
    };

    const handleUnlockAttempt = async (attemptId: number) => {
        const isSuccess = await unlockStudent(attemptId);
        if (isSuccess) {
            loadMonitoringData();
        }
    };

    const activeCount = useMemo(
        () => attempts.filter((item) => item.status === "IN_PROGRESS").length,
        [attempts]
    );
    const lockedCount = useMemo(
        () => attempts.filter((item) => item.isLocked).length,
        [attempts]
    );
    const violationTotal = useMemo(
        () => attempts.reduce((acc, curr) => acc + curr.violationCount, 0),
        [attempts]
    );

    const paginatedAttempts = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return attempts.slice(start, start + ITEMS_PER_PAGE);
    }, [attempts, currentPage]);

    return (
        <div className="flex h-full w-full flex-col gap-3 overflow-y-auto lg:overflow-hidden pr-0.5">
            {/* 1. KARTU METRIK RINGKAS (RESPONSIF MOBILE KE DESKTOP) */}
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3 shrink-0">
                <MetricCard title="Siswa Aktif Mengerjakan" value={activeCount} variant="success" />
                <MetricCard title="Siswa Terkunci (Locked)" value={lockedCount} variant="warning" />
                <MetricCard title="Total Catatan Pelanggaran" value={violationTotal} variant="danger" />
            </div>

            {/* 2. FILTER TOOLBAR TERPADU */}
            <form
                onSubmit={handleFilterSubmit}
                className="flex shrink-0 flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-xs sm:flex-row sm:items-center sm:justify-between"
            >
                <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:gap-3 w-full sm:w-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Scope Pengawasan:
          </span>
                    <div className="w-full sm:w-32">
                        <TextField
                            size="sm"
                            variant="outlined"
                            placeholder="Quiz ID"
                            leftIcon={Hash}
                            type="number"
                            value={quizIdFilter}
                            onChange={(e) => setQuizIdFilter(e.target.value)}
                        />
                    </div>
                    <div className="w-full sm:w-44">
                        <TextField
                            size="sm"
                            variant="outlined"
                            placeholder="Ruangan (cth: Lab 01)"
                            leftIcon={DoorOpen}
                            value={roomFilter}
                            onChange={(e) => setRoomFilter(e.target.value)}
                        />
                    </div>
                    <Button
                        type="submit"
                        color="primary"
                        size="sm"
                        variant="filled"
                        leftIcon={Search}
                        disabled={monitoringLoading}
                        className="h-9 px-4 text-xs font-semibold w-full sm:w-auto"
                    >
                        Terapkan
                    </Button>
                </div>

                <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    color="secondary"
                    leftIcon={RefreshCw}
                    loading={monitoringLoading}
                    onClick={loadMonitoringData}
                    className="h-9 px-3 text-xs w-full sm:w-auto"
                >
                    Sinkronkan
                </Button>
            </form>

            {/* 3. COCKPIT RESPONSIF (1 KOLOM DI MOBILE / 12 KOLOM DI DESKTOP) */}
            <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 lg:grid-cols-12 lg:overflow-hidden">
                {/* KOLOM 1: TABEL MONITORING SISWA */}
                <section className="col-span-1 lg:col-span-6 flex flex-col min-h-[420px] lg:min-h-0 h-full overflow-hidden rounded-2xl border border-slate-200 bg-white p-3.5 shadow-xs">
                    <div className="mb-2 flex shrink-0 items-center justify-between border-b border-slate-100 pb-2">
                        <div className="flex items-center gap-2">
                            <Users className="size-4 text-indigo-600" />
                            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                                Pemantauan Siswa Real-Time
                            </h2>
                        </div>
                        <span className="text-[11px] font-semibold text-slate-400">
              Total {attempts.length} Sesi Terdaftar
            </span>
                    </div>

                    <div className="flex-1 overflow-x-auto overflow-y-auto rounded-xl border border-slate-100">
                        <Table responsive wrapperClassName="h-full">
                            <TableHead sticky>
                                <TableRow>
                                    <TableHeaderCell className="text-white text-[11px] py-2">Attempt</TableHeaderCell>
                                    <TableHeaderCell className="text-white text-[11px] py-2">User</TableHeaderCell>
                                    <TableHeaderCell className="text-white text-[11px] py-2">Ruang</TableHeaderCell>
                                    <TableHeaderCell className="text-white text-[11px] py-2">Pelanggaran</TableHeaderCell>
                                    <TableHeaderCell className="text-white text-[11px] py-2">Status</TableHeaderCell>
                                    <TableHeaderCell className="text-right text-white text-[11px] py-2">Aksi</TableHeaderCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {monitoringLoading && attempts.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="py-8 text-center text-xs text-slate-400">
                                            Memuat data sesi ujian...
                                        </TableCell>
                                    </TableRow>
                                ) : paginatedAttempts.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="py-8 text-center text-xs text-slate-400">
                                            Tidak ada peserta pengerjaan kuis yang ditemukan.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    paginatedAttempts.map((item) => {
                                        const isSelected = selectedAttemptRecordId === item.id;
                                        const canUnlock =
                                            item.isLocked &&
                                            item.status !== "DISQUALIFIED" &&
                                            item.status !== "COMPLETED";

                                        return (
                                            <TableRow
                                                key={item.id}
                                                onClick={() => setSelectedAttemptRecordId(item.id)}
                                                className={`cursor-pointer transition-colors ${
                                                    isSelected ? "bg-indigo-50/80 ring-1 ring-inset ring-indigo-300" : ""
                                                }`}
                                            >
                                                <TableCell className="font-mono text-xs font-bold text-slate-900 py-2">
                                                    #{item.attemptId}
                                                </TableCell>
                                                <TableCell className="text-xs font-medium text-slate-700 py-2">
                                                    {item.userId}
                                                </TableCell>
                                                <TableCell className="text-xs text-slate-600 py-2">
                                                    {item.roomNumber ?? "-"}
                                                </TableCell>
                                                <TableCell className="text-xs py-2">
                          <span
                              className={`font-semibold ${
                                  item.violationCount >= item.maxAllowedViolations
                                      ? "text-red-600"
                                      : "text-slate-800"
                              }`}
                          >
                            {item.violationCount}/{item.maxAllowedViolations}
                          </span>
                                                </TableCell>
                                                <TableCell className="py-2">
                                                    <StatusBadge status={item.status} isLocked={item.isLocked} />
                                                </TableCell>
                                                <TableCell className="text-right py-2">
                                                    {canUnlock ? (
                                                        <Button
                                                            type="button"
                                                            color="warning"
                                                            size="sm"
                                                            variant="filled"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleUnlockAttempt(item.attemptId);
                                                            }}
                                                            disabled={monitoringLoading}
                                                            className="h-6 text-[10px] px-2 font-semibold shadow-xs"
                                                        >
                                                            Buka 🔓
                                                        </Button>
                                                    ) : (
                                                        <span className="text-[11px] text-slate-400">-</span>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {attempts.length > 0 && (
                        <div className="shrink-0 border-t border-slate-100 pt-1">
                            <Pagination
                                currentPage={currentPage}
                                totalItems={attempts.length}
                                itemsPerPage={ITEMS_PER_PAGE}
                                onPageChangeAction={setCurrentPage}
                            />
                        </div>
                    )}
                </section>

                {/* KOLOM 2: AUDIT BUKTI (SNAPSHOT PELANGGARAN) */}
                <section className="col-span-1 lg:col-span-3 flex flex-col min-h-[380px] lg:min-h-0 h-full overflow-hidden rounded-2xl border border-slate-200 bg-white p-3.5 shadow-xs">
                    <div className="mb-2 flex shrink-0 items-center justify-between border-b border-slate-100 pb-2">
                        <div className="flex items-center gap-1.5">
                            <ShieldAlert className="size-4 text-amber-600" />
                            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                                Audit Bukti
                            </h2>
                        </div>
                        {violations.length > 0 && (
                            <button
                                type="button"
                                onClick={() => setModalAttemptId(selectedAttemptRecordId || violations[0]?.attemptRecordId)}
                                className="text-[11px] font-semibold text-indigo-600 hover:underline cursor-pointer"
                            >
                                Semua
                            </button>
                        )}
                    </div>

                    <div className="flex-1 space-y-2.5 overflow-y-auto pr-1">
                        {violationsLoading && violations.length === 0 ? (
                            <div className="flex h-full items-center justify-center text-center text-xs text-slate-400">
                                Memuat snapshot insiden...
                            </div>
                        ) : violations.length === 0 ? (
                            <div className="flex h-full flex-col items-center justify-center text-center p-4 text-xs text-slate-400">
                                <ShieldAlert className="size-7 text-slate-300 mb-1.5" />
                                Tidak ada riwayat pelanggaran pada siswa yang dipilih.
                            </div>
                        ) : (
                            violations.slice(0, 4).map((v) => (
                                <EvidenceCard
                                    key={v.id}
                                    violation={v}
                                    onVerifyHash={(id) => verifyIntegrity(id)}
                                />
                            ))
                        )}
                    </div>
                </section>

                {/* KOLOM 3: CHAT KOORDINASI PENGAWAS */}
                <section className="col-span-1 lg:col-span-3 flex flex-col min-h-[440px] lg:min-h-0 h-full overflow-hidden rounded-2xl border border-slate-200 bg-white p-3.5 shadow-xs">
                    <div className="mb-2 flex shrink-0 items-center gap-1.5 border-b border-slate-100 pb-2">
                        <MessageSquare className="size-4 text-emerald-600" />
                        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                            Koordinasi
                        </h2>
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <ProctorChatPanel
                            defaultQuizId={activeQuizId ?? 10}
                            defaultRoomNumber={roomFilter}
                            className="h-full border-0 shadow-none"
                        />
                    </div>
                </section>
            </div>

            {modalAttemptId && (
                <ViolationEvidenceModal
                    isOpen={Boolean(modalAttemptId)}
                    attemptRecordId={modalAttemptId}
                    onClose={() => setModalAttemptId(null)}
                />
            )}
        </div>
    );
};