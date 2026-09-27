"use client";

import {ShieldAlert, ShieldCheck, UserCog} from "lucide-react";
import React, {useEffect, useState} from "react";
import {useProctorManagementApi} from "@/modules/proctor-management/presentations/hook/useProctorManagementApi";
import Button from "@/shared-ui/component/Button";
import {Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow,} from "@/shared-ui/component/Table";
import {ProctorAssignmentModal} from "../organisms/ProctorAssignmentModal";
import SearchField from "@/shared-ui/component/SearchField";

export default function ProctorManagementPage() {
  const { proctors, loading, fetchProctors } = useProctorManagementApi();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    void fetchProctors();
  }, [fetchProctors]);

  const filteredProctors = proctors.filter((p) =>
    p.fullName.toLowerCase().includes(search.toLowerCase()) ||
    p.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex h-full flex-col p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <UserCog className="size-6 text-indigo-600" />
            Manajemen Pengawas
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Kelola data pengawas, penetapan ruangan, dan sinkronisasi dengan Moodle.
          </p>
        </div>
        <Button
          color="primary"
          variant="filled"
          onClick={() => setIsModalOpen(true)}
          className="shadow-md"
        >
          Kelola / Tambah Pengawas
        </Button>
      </div>

      <div className="flex bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex-col space-y-4">
        <div className="w-full max-w-sm">
          <SearchField 
            placeholder="Cari nama atau username..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            onClear={() => setSearch("")} 
          />
        </div>

        <Table stickyHeader maxHeight="65vh">
          <TableHead sticky className="bg-gray-50">
            <TableRow>
              <TableHeaderCell>Nama Lengkap</TableHeaderCell>
              <TableHeaderCell>Username</TableHeaderCell>
              <TableHeaderCell>Peran</TableHeaderCell>
              <TableHeaderCell>Ruangan</TableHeaderCell>
              <TableHeaderCell>Status Aktif</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading && proctors.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                  Memuat data pengawas...
                </TableCell>
              </TableRow>
            ) : filteredProctors.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                  Tidak ada pengawas ditemukan.
                </TableCell>
              </TableRow>
            ) : (
              filteredProctors.map((proctor) => (
                <TableRow key={proctor.id}>
                  <TableCell className="font-medium text-gray-900">
                    {proctor.fullName}
                  </TableCell>
                  <TableCell className="text-gray-500">{proctor.username}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        proctor.role === "CHIEF_PROCTOR"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {proctor.role === "CHIEF_PROCTOR" ? "Ketua Pengawas" : "Pengawas Ruang"}
                    </span>
                  </TableCell>
                  <TableCell>
                    {proctor.roomNumber ? (
                      <span className="font-mono text-xs font-semibold bg-gray-100 px-2 py-1 rounded border border-gray-200">
                        {proctor.roomNumber}
                      </span>
                    ) : (
                      <span className="text-gray-400 italic">Semua (Global)</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {proctor.isActive ? (
                      <span className="flex items-center gap-1 text-emerald-600 font-semibold text-sm">
                        <ShieldCheck className="size-4" /> Aktif
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-red-500 font-semibold text-sm">
                        <ShieldAlert className="size-4" /> Non-aktif
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {isModalOpen && (
        <ProctorAssignmentModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}
