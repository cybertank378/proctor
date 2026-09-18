//Files: src/sections/violations/organisms/ViolationEvidenceModal.tsx
"use client";

import type React from "react";
import {useEffect} from "react";
import {useViolationsApi} from "@/modules/violations/presentations/hook/useViolationsApi";
import {Modal} from "@/shared-ui/component/Modal";
import {EvidenceCard} from "../molecules/EvidenceCard";

interface ViolationEvidenceModalProps {
    readonly isOpen: boolean;
    readonly onClose: () => void;
    readonly attemptRecordId: string;
    readonly studentIdentifier?: string;
}

export const ViolationEvidenceModal: React.FC<ViolationEvidenceModalProps> = ({
                                                                                                  isOpen,
                                                                                                  onClose,
                                                                                                  attemptRecordId,
                                                                                                  studentIdentifier = "Siswa",
                                                                                              }) => {
    const { loading, violations, fetchViolations, verifyIntegrity } = useViolationsApi();

    useEffect(() => {
        if (isOpen && attemptRecordId) {
            fetchViolations(attemptRecordId);
        }
    }, [isOpen, attemptRecordId, fetchViolations]);

    return (
        <Modal
            open={isOpen}
            onClose={onClose}
            title={`Log Bukti Kecurangan: ${studentIdentifier}`}
        >
            <div className="max-h-[75vh] overflow-y-auto pr-1">
                {loading && violations.length === 0 ? (
                    <div className="py-12 text-center text-sm text-gray-500">
                        Mengambil rekaman berkas bukti fisik...
                    </div>
                ) : violations.length === 0 ? (
                    <div className="py-12 text-center text-sm text-gray-500">
                        Tidak ada bukti pelanggaran tersimpan untuk sesi pengerjaan ini.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {violations.map((item) => (
                            <EvidenceCard
                                key={item.id}
                                violation={item}
                                onVerifyHash={(id) => verifyIntegrity(id)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </Modal>
    );
};