//Files: src/sections/proctor-management/organisms/ProctorAssignmentModal.tsx
"use client";

import type React from "react";
import {useEffect, useState} from "react";
import {DoorOpen, KeyRound, RefreshCw, User, UserCheck, UserPlus} from "lucide-react";
import Button from "@/shared-ui/component/Button";
import {Modal} from "@/shared-ui/component/Modal";
import SelectField from "@/shared-ui/component/SelectField";
import TextField from "@/shared-ui/component/TextField";
import {useProctorManagementApi} from "@/modules/proctor-management/presentations/hook/useProctorManagementApi";
import {ProctorSelectItem} from "../molecules/ProctorSelectItem";

interface ProctorAssignmentModalProps {
    readonly isOpen: boolean;
    readonly defaultRoomNumber?: string;
    readonly onClose: () => void;
}

export const ProctorAssignmentModal: React.FC<ProctorAssignmentModalProps> = ({
                                                                                  isOpen,
                                                                                  defaultRoomNumber = "",
                                                                                  onClose,
                                                                              }) => {
    const {
        proctors,
        loading,
        fetchProctors,
        createProctor,
        assignProctor,
        syncFromMoodle,
    } = useProctorManagementApi();

    const [activeTab, setActiveTab] = useState<"assign" | "create">("assign");

    // State Form Alokasi Ruangan
    const [selectedProctorId, setSelectedProctorId] = useState<string>("");
    const [roomNumber, setRoomNumber] = useState<string>(defaultRoomNumber);

    // State Form Akun Baru
    const [username, setUsername] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [fullName, setFullName] = useState<string>("");
    const [role, setRole] = useState<"PROCTOR" | "CHIEF_PROCTOR">("PROCTOR");
    const [initialRoom, setInitialRoom] = useState<string>(defaultRoomNumber);

    useEffect(() => {
        if (isOpen) {
            void fetchProctors();
            setRoomNumber(defaultRoomNumber);
            setInitialRoom(defaultRoomNumber);
        }
    }, [isOpen, fetchProctors, defaultRoomNumber]);

    const handleAssignSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!selectedProctorId || !roomNumber.trim()) return;

        const ok = await assignProctor({
            proctorId: selectedProctorId,
            roomNumber: roomNumber.trim(),
        });

        if (ok) {
            void fetchProctors();
            onClose();
        }
    };

    const handleCreateSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!username.trim() || !password || !fullName.trim()) return;

        const ok = await createProctor({
            username: username.trim(),
            password,
            fullName: fullName.trim(),
            role,
            roomNumber: role === "CHIEF_PROCTOR" ? undefined : initialRoom.trim(),
        });

        if (ok) {
            setUsername("");
            setPassword("");
            setFullName("");
            setActiveTab("assign");
            void fetchProctors();
        }
    };

    return (
        <Modal
            open={isOpen}
            onClose={onClose}
            size="md"
            title="Manajemen Pengawas Ujian"
            subtitle="Alokasikan guru Moodle ke ruang ujian atau daftarkan akun pengawas baru."
        >
            {/* Tab Navigasi menggunakan Button shared-ui */}
            <div className="mb-5 flex border-b border-gray-200">
                <Button
                    type="button"
                    variant="text"
                    color={activeTab === "assign" ? "primary" : "secondary"}
                    leftIcon={UserCheck}
                    onClick={() => setActiveTab("assign")}
                    className={`border-b-2 rounded-none px-4 py-2 text-xs font-bold ${
                        activeTab === "assign"
                            ? "border-indigo-600 font-extrabold"
                            : "border-transparent text-gray-500"
                    }`}
                >
                    Tugaskan ke Ruangan
                </Button>
                <Button
                    type="button"
                    variant="text"
                    color={activeTab === "create" ? "primary" : "secondary"}
                    leftIcon={UserPlus}
                    onClick={() => setActiveTab("create")}
                    className={`border-b-2 rounded-none px-4 py-2 text-xs font-bold ${
                        activeTab === "create"
                            ? "border-indigo-600 font-extrabold"
                            : "border-transparent text-gray-500"
                    }`}
                >
                    Tambah Akun Baru
                </Button>
            </div>

            {activeTab === "assign" ? (
                <form onSubmit={handleAssignSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-700">
                Pilih Guru Pengawas (Moodle)
              </span>
                            <Button
                                type="button"
                                variant="text"
                                color="primary"
                                size="sm"
                                leftIcon={RefreshCw}
                                loading={loading}
                                onClick={() => void syncFromMoodle()}
                                className="h-auto p-0 text-xs hover:bg-transparent"
                            >
                                Tarik Data Guru Moodle
                            </Button>
                        </div>

                        <SelectField
                            size="sm"
                            value={selectedProctorId}
                            onChange={(e) => {
                                setSelectedProctorId(e.target.value);
                                const selected = proctors.find((p) => p.id === e.target.value);
                                if (selected?.roomNumber) {
                                    setRoomNumber(selected.roomNumber);
                                }
                            }}
                            required
                        >
                            <option value="">-- Pilih Guru / Pengawas Terdaftar --</option>
                            {proctors.map((p) => (
                                <ProctorSelectItem key={p.id} proctor={p} />
                            ))}
                        </SelectField>
                    </div>

                    <div>
                        <TextField
                            size="sm"
                            label="Ruangan Pengawasan"
                            placeholder="Contoh: Lab Komputer 1 atau R.204"
                            leftIcon={DoorOpen}
                            value={roomNumber}
                            onChange={(e) => setRoomNumber(e.target.value)}
                            required
                        />
                    </div>

                    <div className="mt-6 flex justify-end gap-3 border-t border-gray-100 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            color="secondary"
                            size="sm"
                            onClick={onClose}
                        >
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            variant="filled"
                            color="primary"
                            size="sm"
                            loading={loading}
                        >
                            Simpan Penugasan
                        </Button>
                    </div>
                </form>
            ) : (
                <form onSubmit={handleCreateSubmit} className="space-y-3.5">
                    <div>
                        <TextField
                            size="sm"
                            label="Nama Lengkap"
                            placeholder="Contoh: Budi Santoso, M.Kom"
                            leftIcon={User}
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div>
                            <TextField
                                size="sm"
                                label="Username"
                                placeholder="Contoh: proctor_lab1"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <SelectField
                                size="sm"
                                label="Peran Pengawas"
                                value={role}
                                onChange={(e) => setRole(e.target.value as "PROCTOR" | "CHIEF_PROCTOR")}
                            >
                                <option value="PROCTOR">PROCTOR (Pengawas Ruang)</option>
                                <option value="CHIEF_PROCTOR">CHIEF_PROCTOR (Ketua)</option>
                            </SelectField>
                        </div>
                    </div>

                    <div>
                        <TextField
                            size="sm"
                            type="password"
                            label="Kata Sandi"
                            placeholder="Minimal 6 karakter"
                            leftIcon={KeyRound}
                            enablePasswordToggle
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            minLengthValue={6}
                            required
                        />
                    </div>

                    {role === "PROCTOR" && (
                        <div>
                            <TextField
                                size="sm"
                                label="Alokasi Ruangan Awal (Opsional)"
                                placeholder="Contoh: Lab Komputer 1"
                                leftIcon={DoorOpen}
                                value={initialRoom}
                                onChange={(e) => setInitialRoom(e.target.value)}
                            />
                        </div>
                    )}

                    <div className="mt-6 flex justify-end gap-3 border-t border-gray-100 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            color="secondary"
                            size="sm"
                            onClick={() => setActiveTab("assign")}
                        >
                            Kembali
                        </Button>
                        <Button
                            type="submit"
                            variant="filled"
                            color="primary"
                            size="sm"
                            loading={loading}
                        >
                            Buat Akun Pengawas
                        </Button>
                    </div>
                </form>
            )}
        </Modal>
    );
};