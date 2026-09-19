// Files: src/sections/exam-monitoring/organisms/ExamMonitoringTableView.tsx
"use client";

import {DoorOpen, Hash, Search} from "lucide-react";
import type React from "react";
import {useCallback, useEffect, useMemo, useState} from "react";
import {useExamMonitoringApi} from "@/modules/exam-monitoring/presentations/presentations/hook/useExamMonitoringApi";
import Button from "@/shared-ui/component/Button";
import Pagination from "@/shared-ui/component/Pagination";
import {Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow,} from "@/shared-ui/component/Table";
import TextField from "@/shared-ui/component/TextField";
import {StatusBadge} from "../atoms/StatusBadge";
import {MetricCard} from "../molecules/MetricCard";

const ITEMS_PER_PAGE = 10;

export const ExamMonitoringTableView: React.FC = () => {
  const { loading, attempts, fetchAttempts, unlockStudent } =
    useExamMonitoringApi();

  const [quizIdFilter, setQuizIdFilter] = useState<string>("");
  const [roomFilter, setRoomFilter] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);

  const loadData = useCallback(() => {
    void fetchAttempts(
      quizIdFilter ? Number(quizIdFilter) : undefined,
      roomFilter.trim() || undefined,
    );
  }, [fetchAttempts, quizIdFilter, roomFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleFilterSubmit = (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCurrentPage(1);
    loadData();
  };

  const handleUnlock = async (attemptId: number) => {
    const success = await unlockStudent(attemptId);
    if (success) {
      loadData();
    }
  };

  // Ringkasan metrik statistik
  const activeCount = useMemo(
    () => attempts.filter((item) => item.status === "IN_PROGRESS").length,
    [attempts],
  );
  const lockedCount = useMemo(
    () => attempts.filter((item) => item.isLocked).length,
    [attempts],
  );
  const violationTotal = useMemo(
    () => attempts.reduce((acc, curr) => acc + curr.violationCount, 0),
    [attempts],
  );

  // Client pagination slice
  const paginatedAttempts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return attempts.slice(start, start + ITEMS_PER_PAGE);
  }, [attempts, currentPage]);

  return (
    <div className="space-y-6">
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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

      {/* Filter Toolbar */}
      <form
        onSubmit={handleFilterSubmit}
        className="flex flex-wrap items-center gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
      >
        <div className="w-full sm:w-64">
          <TextField
            size="sm"
            variant="outlined"
            placeholder="Filter ID Kuis Moodle"
            leftIcon={Hash}
            type="number"
            value={quizIdFilter}
            onChange={(e) => setQuizIdFilter(e.target.value)}
          />
        </div>

        <div className="w-full sm:w-64">
          <TextField
            size="sm"
            variant="outlined"
            placeholder="Filter Ruangan (misal: Lab 01)"
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
          disabled={loading}
          className="h-9 px-4 font-semibold"
        >
          Cari
        </Button>
      </form>

      {/* Data Table */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
        <Table responsive wrapperClassName="rounded-2xl">
          <TableHead sticky>
            <TableRow>
              <TableHeaderCell className="text-white">
                Attempt ID
              </TableHeaderCell>
              <TableHeaderCell className="text-white">Quiz ID</TableHeaderCell>
              <TableHeaderCell className="text-white">User ID</TableHeaderCell>
              <TableHeaderCell className="text-white">Ruangan</TableHeaderCell>
              <TableHeaderCell className="text-white">
                Pelanggaran
              </TableHeaderCell>
              <TableHeaderCell className="text-white">Status</TableHeaderCell>
              <TableHeaderCell className="text-right text-white">
                Aksi
              </TableHeaderCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {loading && attempts.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="py-8 text-center text-gray-500"
                >
                  Memuat data pemantauan ujian siswa...
                </TableCell>
              </TableRow>
            ) : paginatedAttempts.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="py-8 text-center text-gray-500"
                >
                  Tidak ada data pengerjaan ujian ditemukan.
                </TableCell>
              </TableRow>
            ) : (
              paginatedAttempts.map((item) => {
                const isOverTolerance =
                  item.violationCount >= item.maxAllowedViolations;
                const canUnlock =
                  item.isLocked &&
                  item.status !== "DISQUALIFIED" &&
                  item.status !== "COMPLETED";

                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-mono font-semibold text-gray-900">
                      #{item.attemptId}
                    </TableCell>
                    <TableCell>{item.quizId}</TableCell>
                    <TableCell>{item.userId}</TableCell>
                    <TableCell>{item.roomNumber ?? "-"}</TableCell>
                    <TableCell>
                      <span
                        className={`font-semibold ${
                          isOverTolerance
                            ? "text-red-600 font-bold"
                            : "text-gray-900"
                        }`}
                      >
                        {item.violationCount} / {item.maxAllowedViolations}
                      </span>
                    </TableCell>
                    <TableCell>
                      <StatusBadge
                        status={item.status}
                        isLocked={item.isLocked}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      {canUnlock ? (
                        <Button
                          type="button"
                          color="warning"
                          size="sm"
                          variant="filled"
                          onClick={() => {
                            void handleUnlock(item.attemptId);
                          }}
                          disabled={loading}
                          className="h-7 text-xs font-semibold shadow-sm"
                        >
                          Buka Kunci 🔓
                        </Button>
                      ) : (
                        <span className="text-xs font-medium text-gray-400">
                          -
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        {/* Pagination Section */}
        {attempts.length > 0 && (
          <div className="border-t border-gray-100 px-4 py-2">
            <Pagination
              currentPage={currentPage}
              totalItems={attempts.length}
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChangeAction={setCurrentPage}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ExamMonitoringTableView;
