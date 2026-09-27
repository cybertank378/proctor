// src/sections/dashboard/organisms/UnifiedProctorCockpit.tsx
"use client";

import {
  DoorOpen,
  Hash,
  Maximize2,
  MessageSquare,
  Minimize2,
  RefreshCw,
  Search,
  ShieldAlert,
  Sparkles,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import type React from "react";
import {useCallback, useEffect, useMemo, useState} from "react";
import type {ExamAttemptSummaryDto} from "@/modules/exam-monitoring/domain/dto/MonitoringResponseDto";
import {useExamMonitoringApi} from "@/modules/exam-monitoring/presentations/hook/useExamMonitoringApi";
import {StatusBadge} from "@/sections/exam-monitoring/atoms/StatusBadge";
import {MetricCard} from "@/sections/exam-monitoring/molecules/MetricCard";
import {ExamSessionSelectorModal} from "@/sections/exam-monitoring/organisms/ExamSessionSelectorModal";
import {useLiveProctoring} from "@/modules/live-proctoring/presentations/hook/useLiveProctoring";
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

type ChatPanelState = "normal" | "minimized" | "maximized";

const TableFeedbackRow: React.FC<{ readonly message: string }> = ({
  message,
}) => (
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
  readonly liveFrame?: string;
}

const AttemptRowItem: React.FC<AttemptRowItemProps> = ({
  item,
  isSelected,
  isLoading,
  onSelect,
  onUnlock,
  liveFrame,
}) => {
  const canUnlock =
    item.isLocked &&
    item.status !== "DISQUALIFIED" &&
    item.status !== "COMPLETED";

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
      <TableCell className="text-xs py-2">
        <div className="flex items-center gap-3">
          {/* Live Thumbnail */}
          <div className="relative shrink-0 size-10 rounded overflow-hidden bg-slate-100 border border-slate-200 shadow-sm flex items-center justify-center">
            {liveFrame ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={liveFrame} alt="Live feed" className="object-cover w-full h-full" />
            ) : (
              <span className="text-[9px] text-slate-400 font-medium">Offline</span>
            )}
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="font-bold text-slate-900 truncate max-w-[150px]">
              {item.studentName || `Siswa #${item.userId}`}
            </span>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
              <span className="inline-flex items-center rounded-md bg-blue-50 px-1.5 py-0.5 font-medium text-blue-700 border border-blue-100">
                {item.className || "-"}
              </span>
              <span className="font-mono text-[10px] text-slate-400">
                ID: {item.userId}
              </span>
            </div>
          </div>
        </div>
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
        {item.isLocked && item.unlockPin && (
          <div className="mt-1 text-[10px] text-slate-500">
            PIN: <span className="font-bold font-mono text-slate-700">{item.unlockPin}</span>
          </div>
        )}
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
    activeQuizInfo,
    availableQuizzes,
    fetchActiveQuiz,
    fetchAvailableQuizzes,
    fetchAttempts,
    unlockStudent,
  } = useExamMonitoringApi();

  const {
    loading: violationsLoading,
    violations,
    fetchViolations,
    verifyIntegrity,
  } = useViolationsApi();

  const [quizIdFilter, setQuizIdFilter] = useState<string>("");
  
  const activeQuizId = useMemo(() => {
    const val = Number(quizIdFilter);
    return Number.isInteger(val) && val > 0 ? val : undefined;
  }, [quizIdFilter]);

  const { frames, isConnected } = useLiveProctoring(activeQuizId);

  const [roomFilter, setRoomFilter] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isDetectingQuiz, setIsDetectingQuiz] = useState<boolean>(false);

  const [selectedAttemptRecordId, setSelectedAttemptRecordId] = useState<
    string | null
  >(null);
  const [modalAttemptId, setModalAttemptId] = useState<string | null>(null);
  const [isProctorModalOpen, setIsProctorModalOpen] = useState<boolean>(false);
  const [isSessionModalOpen, setIsSessionModalOpen] = useState<boolean>(false);

  const [chatState, setChatState] = useState<ChatPanelState>("normal");
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const initActiveQuiz = useCallback(
    async (room?: string) => {
      setIsDetectingQuiz(true);
      const resolvedQuizId = await fetchActiveQuiz(room);
      if (resolvedQuizId) {
        setQuizIdFilter(String(resolvedQuizId));
      }
      setIsDetectingQuiz(false);
    },
    [fetchActiveQuiz],
  );

  useEffect(() => {
    void initActiveQuiz(roomFilter);
  }, [initActiveQuiz, roomFilter]);

  const loadMonitoringData = useCallback(async () => {
    const resolvedQuizId = activeQuizId ? Number(activeQuizId) : undefined;
    const resolvedRoom =
      roomFilter.trim().length > 0 ? roomFilter.trim() : undefined;

    console.log(
      "[COCKPIT REFETCH] Fetching attempts for Quiz:",
      resolvedQuizId,
      "Room:",
      resolvedRoom,
    );
    await fetchAttempts(resolvedQuizId, resolvedRoom);
  }, [fetchAttempts, activeQuizId, roomFilter]);

  useEffect(() => {
    if (activeQuizId) {
      void loadMonitoringData();
    }
  }, [loadMonitoringData, activeQuizId]);

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

  const handleFilterSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
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

  const handleIncomingMessage = useCallback(() => {
    if (chatState === "minimized") {
      setUnreadCount((prev) => prev + 1);
    }
  }, [chatState]);

  const restoreChatPanel = () => {
    setChatState("normal");
    setUnreadCount(0);
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

  const quizHelperLabel = useMemo(() => {
    if (isDetectingQuiz) return "Mendeteksi kuis...";
    if (!activeQuizInfo) return undefined;
    if (activeQuizInfo.source === "ACTIVE_SESSION")
      return "Terdeteksi: Sesi Berjalan";
    if (activeQuizInfo.source === "MOODLE_SCHEDULE") {
      return `Terdeteksi: ${activeQuizInfo.quizName ?? "Jadwal Moodle"}`;
    }
    return "Terdeteksi: Riwayat Terakhir";
  }, [isDetectingQuiz, activeQuizInfo]);

  return (
    <div className="relative flex h-full w-full flex-col gap-4 overflow-y-auto lg:overflow-hidden pr-0.5 pb-8 lg:pb-0">
      {/* Metrik Statistik */}
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3 shrink-0 w-full">
        <MetricCard
          title="Siswa Aktif Mengerjakan"
          value={activeCount}
          variant="success"
        />
        <MetricCard
          title="Siswa Terkunci (Locked)"
          value={lockedCount}
          variant="warning"
        />
        <MetricCard
          title="Total Catatan Pelanggaran"
          value={violationTotal}
          variant="danger"
        />
      </div>

      {/* Toolbar Filter */}
      <form
        onSubmit={handleFilterSubmit}
        className="grid grid-cols-1 gap-3.5 rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs xl:grid-cols-[auto_auto] xl:items-center xl:justify-between w-full"
      >
        {/* Scope Pengawasan */}
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-[auto_11rem_12rem_auto] sm:items-center">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700 whitespace-nowrap">
            Scope Pengawasan:
          </span>

          <div className="flex gap-2 w-full">
            <TextField
              size="sm"
              variant="outlined"
              placeholder="Quiz ID"
              leftIcon={isDetectingQuiz ? Sparkles : Hash}
              type="number"
              value={quizIdFilter}
              onChange={(e) => setQuizIdFilter(e.target.value)}
              helperText={quizHelperLabel}
              success={Boolean(activeQuizInfo)}
            />
            <Button
              type="button"
              color="secondary"
              variant="outline"
              size="sm"
              className="h-9 px-3 shrink-0 self-start"
              onClick={() => setIsSessionModalOpen(true)}
              title="Pilih Kuis dari Moodle"
            >
              Pilih
            </Button>
          </div>

          <div className="w-full">
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
            disabled={monitoringLoading || isDetectingQuiz}
            className="h-9 px-4 text-xs font-semibold w-full sm:w-auto"
          >
            Terapkan
          </Button>
        </div>

        {/* Aksi Proctor & Sinkronisasi */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full xl:w-auto items-center">
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

      {/* Grid Cockpit */}
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-12 lg:overflow-hidden">
        {/* Panel Tabel Monitoring */}
        <section
          className={`flex flex-col h-120 lg:h-full overflow-hidden rounded-2xl border border-slate-200 bg-white p-3.5 shadow-xs transition-all duration-200 ${
            chatState === "minimized"
              ? "col-span-1 lg:col-span-8"
              : "col-span-1 lg:col-span-6"
          }`}
        >
          <div className="mb-2 flex shrink-0 items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-2">
              <Users className="size-4 text-indigo-600 shrink-0" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 truncate flex items-center gap-2">
                Pemantauan Siswa Real-Time
                {activeQuizId && (
                  <span className="flex items-center gap-1.5 text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    <span className={`size-1.5 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                    {isConnected ? "Live Stream Aktif" : "Menghubungkan..."}
                  </span>
                )}
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
                  <TableHeaderCell className="text-white text-[11px] py-2">
                    Attempt
                  </TableHeaderCell>
                  <TableHeaderCell className="text-white text-[11px] py-2">
                    Siswa & Kelas
                  </TableHeaderCell>
                  <TableHeaderCell className="text-white text-[11px] py-2">
                    Ruang
                  </TableHeaderCell>
                  <TableHeaderCell className="text-white text-[11px] py-2">
                    Pelanggaran
                  </TableHeaderCell>
                  <TableHeaderCell className="text-white text-[11px] py-2">
                    Status
                  </TableHeaderCell>
                  <TableHeaderCell className="text-right text-white text-[11px] py-2">
                    Aksi
                  </TableHeaderCell>
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
                      liveFrame={frames[item.id]?.imagePath}
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

        {/* Panel Audit Bukti Pelanggaran */}
        <section
          className={`flex flex-col h-95 lg:h-full overflow-hidden rounded-2xl border border-slate-200 bg-white p-3.5 shadow-xs transition-all duration-200 ${
            chatState === "minimized"
              ? "col-span-1 lg:col-span-4"
              : "col-span-1 lg:col-span-3"
          }`}
        >
          <div className="mb-2 flex shrink-0 items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-1.5">
              <ShieldAlert className="size-4 text-amber-600 shrink-0" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 truncate">
                Audit Bukti
              </h2>
            </div>
            {violations.length > 0 && (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                color="primary"
                onClick={() =>
                  setModalAttemptId(
                    selectedAttemptRecordId || violations[0]?.attemptRecordId,
                  )
                }
                className="h-6 px-1.5 text-[11px] font-semibold"
              >
                Semua
              </Button>
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

        {/* Panel Saluran Chat (Mode Normal) */}
        {chatState === "normal" && (
          <section className="col-span-1 lg:col-span-3 flex flex-col h-112.5 lg:h-full overflow-hidden rounded-2xl border border-slate-200 bg-white p-3.5 shadow-xs">
            <div className="mb-2 flex shrink-0 items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-1.5">
                <MessageSquare className="size-4 text-emerald-600 shrink-0" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 truncate">
                  Koordinasi
                </h2>
              </div>
              <div className="grid grid-cols-2 gap-1 items-center">
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  color="secondary"
                  iconOnly
                  leftIcon={Minimize2}
                  title="Perkecil Panel (Minimize)"
                  onClick={() => setChatState("minimized")}
                  className="h-7 w-7 text-slate-400 hover:text-slate-600"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  color="secondary"
                  iconOnly
                  leftIcon={Maximize2}
                  title="Perbesar Penuh (Maximize)"
                  onClick={() => setChatState("maximized")}
                  className="h-7 w-7 text-slate-400 hover:text-slate-600"
                />
              </div>
            </div>
            <div className="flex-1 overflow-hidden">
              {activeQuizId ? (
                <ProctorChatPanel
                  defaultQuizId={activeQuizId}
                  defaultRoomNumber={roomFilter}
                  onNewMessage={handleIncomingMessage}
                  className="h-full border-0 shadow-none"
                />
              ) : (
                <div className="flex h-full flex-col items-center justify-center p-4 text-center text-xs text-slate-400">
                  <MessageSquare className="size-6 text-slate-300 mb-2" />
                  {isDetectingQuiz
                    ? "Menghubungkan ke saluran kuis aktif..."
                    : "Pilih atau masukkan Quiz ID untuk membuka obrolan."}
                </div>
              )}
            </div>
          </section>
        )}
      </div>

      {/* Bilah Chat Mengambang saat Minimized */}
      {chatState === "minimized" && (
        <div className="fixed bottom-6 right-6 z-40">
          <Button
            type="button"
            size="md"
            variant="filled"
            color="secondary"
            shape="circle"
            leftIcon={MessageSquare}
            onClick={restoreChatPanel}
            className="relative px-4 py-2.5 text-xs font-semibold shadow-xl active:scale-95 rounded-full! aspect-auto! bg-slate-900 hover:bg-slate-800 text-white"
          >
            <span>Saluran Koordinasi</span>
            {unreadCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1.5 text-[10px] font-bold text-white ring-2 ring-white animate-pulse ml-1">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </Button>
        </div>
      )}

      {/* Modal Layar Penuh saat Maximized */}
      {chatState === "maximized" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="flex h-[88vh] w-full max-w-4xl flex-col rounded-2xl bg-white shadow-2xl overflow-hidden border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 bg-slate-50">
              <div className="flex items-center gap-2">
                <MessageSquare className="size-5 text-emerald-600" />
                <span className="font-bold text-sm text-slate-900">
                  Saluran Koordinasi Pengawas (Layar Penuh)
                </span>
              </div>
              <div className="grid grid-cols-2 gap-1 items-center">
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  color="secondary"
                  iconOnly
                  leftIcon={Minimize2}
                  title="Kembalikan ke Ukuran Normal"
                  onClick={() => setChatState("normal")}
                  className="h-8 w-8 text-slate-500 hover:bg-slate-200"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  color="secondary"
                  iconOnly
                  leftIcon={X}
                  title="Tutup Modal"
                  onClick={() => setChatState("normal")}
                  className="h-8 w-8 text-slate-500 hover:bg-slate-200"
                />
              </div>
            </div>
            <div className="flex-1 overflow-hidden p-2">
              <ProctorChatPanel
                defaultQuizId={activeQuizId}
                defaultRoomNumber={roomFilter}
                className="h-full border-0 shadow-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* Modal Bukti Pelanggaran */}
      {modalAttemptId && (
        <ViolationEvidenceModal
          isOpen={Boolean(modalAttemptId)}
          attemptRecordId={modalAttemptId}
          onClose={() => setModalAttemptId(null)}
        />
      )}

      {/* Modal Alokasi Pengawas */}
      <ProctorAssignmentModal
        isOpen={isProctorModalOpen}
        defaultRoomNumber={roomFilter}
        onClose={() => setIsProctorModalOpen(false)}
      />

      {/* Modal Pemilihan Sesi Ujian */}
      <ExamSessionSelectorModal
        isOpen={isSessionModalOpen}
        onClose={() => setIsSessionModalOpen(false)}
        availableQuizzes={availableQuizzes}
        isLoading={monitoringLoading}
        onSelectQuiz={(quizId) => {
          setQuizIdFilter(String(quizId));
          setCurrentPage(1);
          setTimeout(() => {
            void fetchAttempts(quizId, roomFilter);
          }, 100);
        }}
        onFetch={fetchAvailableQuizzes}
      />
    </div>
  );
};
