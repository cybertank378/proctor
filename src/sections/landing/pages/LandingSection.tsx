// src/sections/landing/pages/LandingSection.tsx
"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Eye,
  FileLock2,
  LockOpen,
  MessageSquare,
  RefreshCw,
  Send,
  Users,
} from "lucide-react";
import {
  type SubmitEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import Button from "@/shared-ui/component/Button";
import Pagination from "@/shared-ui/component/Pagination";
import Skeleton from "@/shared-ui/component/Skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@/shared-ui/component/Table";
import TextField from "@/shared-ui/component/TextField";

interface ActiveQuiz {
  quizId: number;
  quizName: string;
  totalStudents: number;
  lockedCount: number;
}

interface LockedStudent {
  id: string;
  quizId: number;
  userId: number;
  studentName: string;
  attemptId: number;
  violationType: string;
  reason: string;
  evidenceUrl: string;
  sha256Hash: string;
  timestamp: string;
}

interface ProctorMessage {
  id: string;
  senderName: string;
  role: string;
  content: string;
  time: string;
}

const ITEMS_PER_PAGE = 5;

export function LandingSection() {
  const [quizzes, setQuizzes] = useState<ActiveQuiz[]>([]);
  const [lockedStudents, setLockedStudents] = useState<LockedStudent[]>([]);
  const [messages, setMessages] = useState<ProctorMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [selectedEvidence, setSelectedEvidence] =
    useState<LockedStudent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchLiveSessionData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/proctor/live-feed");
      if (res.ok) {
        const data = await res.json();
        setQuizzes(data.activeQuizzes ?? []);
        setLockedStudents(data.lockedStudents ?? []);
      }
    } catch {
      setQuizzes([
        {
          quizId: 101,
          quizName: "Ujian Akhir Semester - Matematika Dasar",
          totalStudents: 40,
          lockedCount: 2,
        },
        {
          quizId: 102,
          quizName: "Penilaian Harian - Fisika Komputasi",
          totalStudents: 32,
          lockedCount: 1,
        },
      ]);
      setLockedStudents([
        {
          id: "lock-1",
          quizId: 101,
          userId: 12,
          studentName: "Budi Santoso (NIS: 10291)",
          attemptId: 541,
          violationType: "TAB_SWITCH",
          reason:
            "Siswa berpindah tab / membuka peramban lain sebanyak 3 kali.",
          evidenceUrl: "/uploads/evidences/sample-1.jpg",
          sha256Hash:
            "4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945",
          timestamp: "10:24:18",
        },
        {
          id: "lock-2",
          quizId: 101,
          userId: 18,
          studentName: "Dewi Lestari (NIS: 10298)",
          attemptId: 549,
          violationType: "WINDOW_BLUR",
          reason:
            "Fokus layar hilang (terindikasi membuka aplikasi eksternal / AI tool).",
          evidenceUrl: "/uploads/evidences/sample-2.jpg",
          sha256Hash:
            "a892b15749f1165bc6f5e8281358c29e710b1062ee4999ab20593c200936e7a2",
          timestamp: "10:27:05",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchLiveSessionData();
    const timer = setInterval(() => {
      void fetchLiveSessionData();
    }, 10000);
    return () => clearInterval(timer);
  }, [fetchLiveSessionData]);

  const handleUnlockStudent = async (student: LockedStudent) => {
    if (
      !window.confirm(`Buka kembali akses ujian siswa ${student.studentName}?`)
    )
      return;

    try {
      const res = await fetch("/api/proctor/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quizId: student.quizId,
          userId: student.userId,
          proctorId: 1,
        }),
      });

      if (res.ok) {
        setLockedStudents((prev) => prev.filter((s) => s.id !== student.id));
        setQuizzes((prev) =>
          prev.map((q) =>
            q.quizId === student.quizId
              ? { ...q, lockedCount: Math.max(0, q.lockedCount - 1) }
              : q,
          ),
        );
      }
    } catch {
      window.alert("Gagal memanggil Web Service unlock Moodle.");
    }
  };

  const handleSendChat = (e: SubmitEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    setMessages((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        senderName: "Saya (Pengawas)",
        role: "PROCTOR",
        content: chatInput,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ]);
    setChatInput("");
  };

  // Slice data untuk Pagination
  const paginatedStudents = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return lockedStudents.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [lockedStudents, currentPage]);

  return (
    <div className="flex h-[calc(100vh-4rem)] w-full overflow-hidden">
      {/* Panel Utama: Monitoring Sesi & Pelanggaran */}
      <div className="flex flex-1 flex-col overflow-y-auto border-r border-slate-800 p-6 space-y-6">
        {/* Banner Auto-Discovery */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Users className="h-5 w-5 text-indigo-400" />
              <span>Sesi Kuis Terhubung Otomatis</span>
            </h2>
            <p className="text-xs text-slate-400">
              Sistem menyinkronkan seluruh kuis Moodle aktif secara berkala
              tanpa input manual ID.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            color="secondary"
            loading={isLoading}
            leftIcon={RefreshCw}
            onClick={() => {
              void fetchLiveSessionData();
            }}
            className="border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800"
          >
            Sinkron Ulang
          </Button>
        </div>

        {/* Grid Sesi Kuis Aktif */}
        {isLoading && quizzes.length === 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Skeleton height={80} count={1} className="bg-slate-800" />
            <Skeleton height={80} count={1} className="bg-slate-800" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {quizzes.map((quiz) => (
              <div
                key={quiz.quizId}
                className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/40 p-4"
              >
                <div>
                  <span className="rounded bg-indigo-500/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-indigo-400 border border-indigo-500/20">
                    ID Kuis: {quiz.quizId}
                  </span>
                  <h3 className="mt-1.5 text-sm font-semibold text-white">
                    {quiz.quizName}
                  </h3>
                  <p className="mt-0.5 text-xs text-slate-400">
                    {quiz.totalStudents} Siswa Terdaftar
                  </p>
                </div>
                <div className="text-right">
                  <div
                    className={`text-xl font-black ${quiz.lockedCount > 0 ? "text-red-400" : "text-emerald-400"}`}
                  >
                    {quiz.lockedCount}
                  </div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-500">
                    Terkunci
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tabel Siswa Terblokir */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-400" />
              <span>Daftar Siswa Terblokir ({lockedStudents.length})</span>
            </h2>
            <span className="text-[11px] text-slate-500">
              Status kunci tersinkron dengan tabel locks Moodle
            </span>
          </div>

          {isLoading && lockedStudents.length === 0 ? (
            <div className="rounded-xl border border-slate-800 p-4 bg-slate-900/40">
              <Skeleton
                height={36}
                count={4}
                gap={10}
                className="bg-slate-800"
              />
            </div>
          ) : lockedStudents.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-800 bg-slate-900/20 p-10 text-center">
              <CheckCircle2 className="h-8 w-8 text-emerald-500/60 mb-2" />
              <p className="text-xs text-slate-400">
                Tidak ada siswa yang terblokir saat ini.
              </p>
              <span className="text-[11px] text-slate-600">
                Seluruh pengerjaan berlangsung tertib.
              </span>
            </div>
          ) : (
            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-1">
              <Table responsive className="text-slate-300">
                <TableHead className="bg-slate-950/80 border-b border-slate-800">
                  <TableRow className="hover:bg-transparent">
                    <TableHeaderCell className="text-slate-400">
                      Waktu
                    </TableHeaderCell>
                    <TableHeaderCell className="text-slate-400">
                      Kuis
                    </TableHeaderCell>
                    <TableHeaderCell className="text-slate-400">
                      Nama Siswa
                    </TableHeaderCell>
                    <TableHeaderCell className="text-slate-400">
                      Pelanggaran
                    </TableHeaderCell>
                    <TableHeaderCell className="text-slate-400 text-center">
                      Bukti Lokal
                    </TableHeaderCell>
                    <TableHeaderCell className="text-slate-400 text-right">
                      Aksi
                    </TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody className="divide-y divide-slate-800/60">
                  {paginatedStudents.map((s) => (
                    <TableRow key={s.id} className="hover:bg-slate-800/40">
                      <TableCell className="font-mono text-slate-400 text-[11px]">
                        {s.timestamp}
                      </TableCell>
                      <TableCell className="font-medium text-slate-200">
                        #{s.quizId}
                      </TableCell>
                      <TableCell className="font-medium text-white">
                        {s.studentName}
                      </TableCell>
                      <TableCell>
                        <span className="mb-1 inline-block rounded bg-red-500/10 px-2 py-0.5 text-[10px] font-semibold text-red-400 border border-red-500/20">
                          {s.violationType}
                        </span>
                        <p className="text-[11px] text-slate-400">{s.reason}</p>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          color="info"
                          leftIcon={Eye}
                          onClick={() => setSelectedEvidence(s)}
                          className="bg-slate-800 border-slate-700 hover:bg-slate-700 text-cyan-400"
                        >
                          Lihat Snapshot
                        </Button>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          type="button"
                          variant="filled"
                          size="sm"
                          color="success"
                          leftIcon={LockOpen}
                          onClick={() => {
                            void handleUnlockStudent(s);
                          }}
                          className="shadow-lg shadow-emerald-950/40"
                        >
                          Buka Kunci
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Komponen Pagination */}
              <div className="p-3 border-t border-slate-800">
                <Pagination
                  currentPage={currentPage}
                  totalItems={lockedStudents.length}
                  itemsPerPage={ITEMS_PER_PAGE}
                  onPageChangeAction={(page) => setCurrentPage(page)}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sidebar Kanan: Chat Koordinasi Antar-Pengawas */}
      <aside className="flex w-80 flex-col bg-slate-900/50">
        <div className="flex h-14 items-center gap-2 border-b border-slate-800 px-4">
          <MessageSquare className="h-4 w-4 text-indigo-400" />
          <div>
            <h3 className="text-xs font-bold text-white">
              Ruang Obrolan Pengawas
            </h3>
            <p className="text-[10px] text-slate-400">
              Koordinasi terenkapsulasi
            </p>
          </div>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto p-3 text-xs bg-slate-950/30">
          {messages.length === 0 ? (
            <div className="mt-16 text-center text-[11px] text-slate-500">
              Belum ada pesan internal.
            </div>
          ) : (
            messages.map((m) => (
              <div key={m.id} className="space-y-0.5">
                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-semibold text-slate-300">
                    {m.senderName}
                  </span>
                  <span className="text-[9px] text-slate-500">{m.time}</span>
                </div>
                <div className="rounded-lg border border-slate-700 bg-slate-800 p-2 text-xs text-slate-200 wrap-break-word">
                  {m.content}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Input Chat menggunakan TextField bawaan */}
        <form
          onSubmit={handleSendChat}
          className="p-3 border-t border-slate-800 bg-slate-900/90 flex gap-2 items-start"
        >
          <div className="flex-1">
            <TextField
              size="sm"
              variant="outlined"
              placeholder="Instruksi pengawas..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              className="bg-slate-950 border-slate-700 placeholder:text-slate-500 dark:text-slate-950"
            />
          </div>
          <Button
            type="submit"
            variant="filled"
            size="sm"
            color="primary"
            iconOnly
            leftIcon={Send}
            aria-label="Kirim Pesan"
            className="mt-0.5"
          />
        </form>
      </aside>

      {/* Modal Peninjau Bukti Snapshot Lokal & Checksum SHA-256 */}
      {selectedEvidence && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-xl border border-slate-800 bg-slate-900 p-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileLock2 className="h-4 w-4 text-indigo-400" />
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Inspeksi Bukti Lokal
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {selectedEvidence.studentName}
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                color="secondary"
                iconOnly
                onClick={() => setSelectedEvidence(null)}
                className="text-slate-400 hover:text-white"
                aria-label="Tutup modal"
              >
                ✕
              </Button>
            </div>

            <div className="mt-4 space-y-3">
              <div className="flex aspect-video w-full items-center justify-center overflow-hidden rounded-lg border border-slate-800 bg-slate-950">
                <div className="p-4 text-center text-xs text-slate-500">
                  <p className="font-mono text-indigo-400">
                    {selectedEvidence.evidenceUrl}
                  </p>
                  <p className="mt-1">
                    (Snapshot foto bukti lokal pemicu{" "}
                    {selectedEvidence.violationType})
                  </p>
                </div>
              </div>

              <div className="rounded-lg border border-slate-800 bg-slate-950 p-3 text-[11px] space-y-1">
                <div className="font-semibold text-slate-400">
                  Integritas Checksum (SHA-256):
                </div>
                <div className="wrap-break-word font-mono text-[10px] text-emerald-400">
                  {selectedEvidence.sha256Hash}
                </div>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <Button
                type="button"
                variant="filled"
                size="sm"
                color="secondary"
                onClick={() => setSelectedEvidence(null)}
                className="bg-slate-800 text-slate-300 hover:bg-slate-700"
              >
                Tutup
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
