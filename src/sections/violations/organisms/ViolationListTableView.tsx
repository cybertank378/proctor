//Files: src/sections/violations/organisms/ViolationListTableView.tsx
"use client";

import type React from "react";
import {useState} from "react";
import {ExternalLink, Filter, Search, ShieldCheck} from "lucide-react";
import {useViolationsApi} from "@/modules/violations/presentations/hook/useViolationsApi";
import Button from "@/shared-ui/component/Button";
import {Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow,} from "@/shared-ui/component/Table";
import TextField from "@/shared-ui/component/TextField";
import {ViolationTypeBadge} from "../atoms/ViolationTypeBadge";
import {ViolationEvidenceModal} from "./ViolationEvidenceModal";


export const ViolationListTableView: React.FC = () => {
    const { loading, violations, fetchViolations, verifyIntegrity } = useViolationsApi();
    const [attemptRecordIdInput, setAttemptRecordIdInput] = useState("");
    const [selectedAttemptId, setSelectedAttemptId] = useState<string | null>(null);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (attemptRecordIdInput.trim()) {
            fetchViolations(attemptRecordIdInput.trim());
        }
    };

    return (
        <div className="space-y-6">
            {/* Search Toolbar */}
            <form
                onSubmit={handleSearch}
                className="flex flex-wrap items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
            >
                <div className="w-full sm:w-80">
                    <TextField
                        size="sm"
                        variant="outlined"
                        placeholder="Masukkan UUID Attempt Record Siswa"
                        leftIcon={Search}
                        value={attemptRecordIdInput}
                        onChange={(e) => setAttemptRecordIdInput(e.target.value)}
                    />
                </div>
                <Button
                    type="submit"
                    color="primary"
                    size="sm"
                    variant="filled"
                    leftIcon={Filter}
                    disabled={loading || !attemptRecordIdInput.trim()}
                    className="h-9 px-4 font-semibold"
                >
                    Cari Log Bukti
                </Button>
            </form>

            {/* Audit Log Table */}
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                <Table responsive wrapperClassName="rounded-2xl">
                    <TableHead sticky>
                        <TableRow>
                            <TableHeaderCell className="text-white">ID Insiden</TableHeaderCell>
                            <TableHeaderCell className="text-white">Tipe Pelanggaran</TableHeaderCell>
                            <TableHeaderCell className="text-white">Waktu Terdeteksi</TableHeaderCell>
                            <TableHeaderCell className="text-white">Checksum SHA-256</TableHeaderCell>
                            <TableHeaderCell className="text-right text-white">Aksi Audit</TableHeaderCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="py-8 text-center text-gray-500">
                                    Memuat data bukti insiden kecurangan...
                                </TableCell>
                            </TableRow>
                        ) : violations.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="py-8 text-center text-gray-500">
                                    {attemptRecordIdInput
                                        ? "Tidak ada data pelanggaran untuk ID attempt tersebut."
                                        : "Masukkan ID attempt pengerjaan untuk menampilkan rekam jejak bukti."}
                                </TableCell>
                            </TableRow>
                        ) : (
                            violations.map((v) => (
                                <TableRow key={v.id}>
                                    <TableCell className="font-mono text-xs font-medium text-gray-800">
                                        {v.id.substring(0, 8)}...
                                    </TableCell>
                                    <TableCell>
                                        <ViolationTypeBadge type={v.type} />
                                    </TableCell>
                                    <TableCell className="text-xs text-gray-600">
                                        {new Date(v.createdAt).toLocaleString("id-ID")}
                                    </TableCell>
                                    <TableCell className="font-mono text-xs text-gray-600">
                                        {v.sha256Hash.substring(0, 16)}...
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                color="secondary"
                                                onClick={() => verifyIntegrity(v.id)}
                                                className="h-7 text-xs"
                                                leftIcon={ShieldCheck}
                                            >
                                                Validasi SHA
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="filled"
                                                color="primary"
                                                onClick={() => setSelectedAttemptId(v.attemptRecordId)}
                                                className="h-7 text-xs"
                                                leftIcon={ExternalLink}
                                            >
                                                Lihat Snapshot
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Modal Galeri Bukti */}
            <ViolationEvidenceModal
                isOpen={Boolean(selectedAttemptId)}
                attemptRecordId={selectedAttemptId ?? ""}
                onClose={() => setSelectedAttemptId(null)}
            />
        </div>
    );
};