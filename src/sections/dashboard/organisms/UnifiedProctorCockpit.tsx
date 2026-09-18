//Files:  src/sections/dashboard/organisms/UnifiedProctorCockpit.tsx
"use client";

import type React from "react";
import {useCallback, useEffect, useMemo, useState} from "react";
import {DoorOpen, Hash, MessageSquare, RefreshCw, Search, ShieldAlert, UserCheck, Users,} from "lucide-react";
import type {ExamAttemptSummaryDto} from "@/modules/exam-monitoring/domain/dto/MonitoringResponseDto";
import {useExamMonitoringApi} from "@/modules/exam-monitoring/presentations/presentations/hook/useExamMonitoringApi";
import {useViolationsApi} from "@/modules/violations/presentations/hook/useViolationsApi";
import {StatusBadge} from "@/sections/exam-monitoring/atoms/StatusBadge";
import {MetricCard} from "@/sections/exam-monitoring/molecules/MetricCard";
import {ProctorChatPanel} from "@/sections/proctor-chat/organisms/ProctorChatPanel";
import {ProctorAssignmentModal} from "@/sections/proctor-management/organisms/ProctorAssignmentModal";
import {EvidenceCard} from "@/sections/violations/molecules/EvidenceCard";
import {ViolationEvidenceModal} from "@/sections/violations/organisms/ViolationEvidenceModal";
import Badge from "@/shared-ui/component/Badge";
import Button from "@/shared-ui/component/Button";
import Pagination from "@/shared-ui/component/Pagination";
import {Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow,} from "@/shared-ui/component/Table";
import TextField from "@/shared-ui/component/TextField";

const ITEMS_PER_PAGE = 7;

const TableFeedbackRow: React.FC<{ readonly message: string }> = ({ message }) => (
    <TableRow>
        <TableCell colSpan={6} className="py-8 text-center text-xs text-slate-400">
            {message}
        </TableCell>
    </TableRow>
);

interface AttemptRowItemProps {
    readonly item: ExamAttemptSummaryDto;
    readonly isSelected: boolean;
    readonly isLoading: boolean;
    readonly onSelect: (id: string) => void;
    readonly onUnlock: (attemptId: number) => void;
}

const AttemptRowItem: React.FC<AttemptRowItemProps> = ({
                                                           item,
                                                           isSelected,
                                                           isLoading,
                                                           onSelect,
                                                           onUnlock,
                                                       }) => {
    const canUnlock =
        item.isLocked && item.status !== "DISQUALIFIED" && item.status !== "COMPLETED";

    return (
        <TableRow
            onClick={() => onSelect(item.id)}
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
                {item.roomNumber ? (
                    <Badge size="sm" variant="soft" color="secondary">
                        {item.roomNumber}
                    </Badge>
                ) : (
                    <span className="text-slate-400">-</span>
                )}
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
                            onUnlock(item.attemptId);
                        }}
                        disabled={isLoading}
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
};

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
    const [isProctorModalOpen, setIsProctorModalOpen] = useState<boolean>(false);

    const activeQuizId = useMemo(() => {
        const val = Number(quizIdFilter);
        return Number.isInteger(val) && val > 0 ? val : undefined;
    }, [quizIdFilter]);

    const loadMonitoringData = useCallback(async () => {
        await fetchAttempts(activeQuizId, roomFilter.trim() || undefined);
    }, [fetchAttempts, activeQuizId, roomFilter]);

    useEffect(() => {
        void loadMonitoringData();
    }, [loadMonitoringData]);

    useEffect(() => {
        const syncViolations = async () => {
            if (selectedAttemptRecordId) {
                await fetchViolations(selectedAttemptRecordId);
            } else if (attempts.length > 0) {
                const firstLocked = attempts.find((a) => a.isLocked) ?? attempts[0];
                if (firstLocked) {
                    setSelectedAttemptRecordId(firstLocked.id);
                    await fetchViolations(firstLocked.id);
                }
            }
        };

        void syncViolations();
    }, [selectedAttemptRecordId, attempts, fetchViolations]);

    const handleFilterSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        setCurrentPage(1);
        void loadMonitoringData();
    };

    const handleUnlockAttempt = async (attemptId: number) => {
        const isSuccess = await unlockStudent(attemptId);
        if (isSuccess) {
            await loadMonitoringData();
        }
    };

    const { activeCount, lockedCount, violationTotal } = useMemo(() => {
        let active = 0;
        let locked = 0;
        let violationsSum = 0;

        for (const item of attempts) {
            if (item.status === "IN_PROGRESS") active += 1;
            if (item.isLocked) locked += 1;
            violationsSum += item.violationCount;
        }

        return {
            activeCount: active,
            lockedCount: locked,
            violationTotal: violationsSum,
        };
    }, [attempts]);

    const paginatedAttempts = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return attempts.slice(start, start + ITEMS_PER_PAGE);
    }, [attempts, currentPage]);

    return (
        <div className="flex h-full w-full flex-col gap-4 overflow-y-auto lg:overflow-hidden pr-0.5 pb-8 lg:pb-0">
            {/* 1. KARTU METRIK: 1 kolom di HP (<640px), 3 kolom di tablet/desktop */}
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3 shrink-0 w-full">
                <MetricCard title="Siswa Aktif Mengerjakan" value={activeCount} variant="success" />
                <MetricCard title="Siswa Terkunci (Locked)" value={lockedCount} variant="warning" />
                <MetricCard title="Total Catatan Pelanggaran" value={violationTotal} variant="danger" />
            </div>

            {/* 2. FILTER TOOLBAR: Mendukung Alokasi Pengawas & Filter Kuis */}
            <form
                onSubmit={handleFilterSubmit}
                className="flex shrink-0 flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs md:flex-row md:items-center md:justify-between w-full"
            >
                <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:gap-3 w-full md:w-auto">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700 whitespace-nowrap">
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
                    <div className="w-full sm:w-48">
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

                <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
                    <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        color="primary"
                        leftIcon={UserCheck}
                        onClick={() => setIsProctorModalOpen(true)}
                        className="h-9 px-3 text-xs w-full sm:w-auto"
                    >
                        Kelola Pengawas
                    </Button>
                    <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        color="secondary"
                        leftIcon={RefreshCw}
                        loading={monitoringLoading}
                        onClick={() => void loadMonitoringData()}
                        className="h-9 px-3 text-xs w-full sm:w-auto"
                    >
                        Sinkronkan
                    </Button>
                </div>
            </form>

            {/* 3. GRID COCKPIT: Mobile = 1 Kolom Vertikal Stack | Desktop = 12 Kolom Sejajar */}
            <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-12 lg:overflow-hidden">
                {/* PANEL 1: TABEL MONITORING SISWA */}
                <section className="col-span-1 lg:col-span-6 flex flex-col h-120 lg:h-full overflow-hidden rounded-2xl border border-slate-200 bg-white p-3.5 shadow-xs">
                    <div className="mb-2 flex shrink-0 items-center justify-between border-b border-slate-100 pb-2">
                        <div className="flex items-center gap-2">
                            <Users className="size-4 text-indigo-600 shrink-0" />
                            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 truncate">
                                Pemantauan Siswa Real-Time
                            </h2>
                        </div>
                        <span className="text-[11px] font-semibold text-slate-400 shrink-0 ml-2">
                            Total {attempts.length} Sesi
                        </span>
                    </div>

                    <div className="flex-1 overflow-x-auto overflow-y-auto rounded-xl border border-slate-100">
                        <Table responsive wrapperClassName="h-full min-w-[500px]">
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
                                    <TableFeedbackRow message="Memuat data sesi ujian..." />
                                ) : paginatedAttempts.length === 0 ? (
                                    <TableFeedbackRow message="Tidak ada peserta pengerjaan kuis yang ditemukan." />
                                ) : (
                                    paginatedAttempts.map((item) => (
                                        <AttemptRowItem
                                            key={item.id}
                                            item={item}
                                            isSelected={selectedAttemptRecordId === item.id}
                                            isLoading={monitoringLoading}
                                            onSelect={(id) => setSelectedAttemptRecordId(id)}
                                            onUnlock={(attId) => void handleUnlockAttempt(attId)}
                                        />
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {attempts.length > 0 && (
                        <div className="shrink-0 border-t border-slate-100 pt-2">
                            <Pagination
                                currentPage={currentPage}
                                totalItems={attempts.length}
                                itemsPerPage={ITEMS_PER_PAGE}
                                onPageChangeAction={setCurrentPage}
                            />
                        </div>
                    )}
                </section>

                {/* PANEL 2: AUDIT BUKTI PELANGGARAN */}
                <section className="col-span-1 lg:col-span-3 flex flex-col h-95 lg:h-full overflow-hidden rounded-2xl border border-slate-200 bg-white p-3.5 shadow-xs">
                    <div className="mb-2 flex shrink-0 items-center justify-between border-b border-slate-100 pb-2">
                        <div className="flex items-center gap-1.5">
                            <ShieldAlert className="size-4 text-amber-600 shrink-0" />
                            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 truncate">
                                Audit Bukti
                            </h2>
                        </div>
                        {violations.length > 0 && (
                            <button
                                type="button"
                                onClick={() => setModalAttemptId(selectedAttemptRecordId || violations[0]?.attemptRecordId)}
                                className="text-[11px] font-semibold text-indigo-600 hover:underline cursor-pointer ml-2"
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
                                    onVerifyHash={(id) => {
                                        void verifyIntegrity(id);
                                    }}
                                />
                            ))
                        )}
                    </div>
                </section>

                {/* PANEL 3: SALURAN CHAT KOORDINASI */}
                <section className="col-span-1 lg:col-span-3 flex flex-col h-112.5 lg:h-full overflow-hidden rounded-2xl border border-slate-200 bg-white p-3.5 shadow-xs">
                    <div className="mb-2 flex shrink-0 items-center gap-1.5 border-b border-slate-100 pb-2">
                        <MessageSquare className="size-4 text-emerald-600 shrink-0" />
                        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 truncate">
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

            {/* Modal Detail Bukti Kejadian Pelanggaran */}
            {modalAttemptId && (
                <ViolationEvidenceModal
                    isOpen={Boolean(modalAttemptId)}
                    attemptRecordId={modalAttemptId}
                    onClose={() => setModalAttemptId(null)}
                />
            )}

            {/* Modal Manajemen & Penugasan Pengawas Moodle */}
            <ProctorAssignmentModal
                isOpen={isProctorModalOpen}
                defaultRoomNumber={roomFilter}
                onClose={() => setIsProctorModalOpen(false)}
            />
        </div>
    );
};