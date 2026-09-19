// src/sections/violations/molecules/EvidenceCard.tsx
"use client";

import {ImageOff, ShieldCheck} from "lucide-react";
import Image from "next/image";
import type React from "react";
import {useState} from "react";
import type {ViolationSummaryDto} from "@/modules/violations/domain/dto/ViolationResponseDto";
import Button from "@/shared-ui/component/Button";
import {ViolationTypeBadge} from "../atoms/ViolationTypeBadge";

interface EvidenceCardProps {
  readonly violation: ViolationSummaryDto;
  readonly onVerifyHash: (violationId: string) => void;
  readonly isVerifying?: boolean;
}

export const EvidenceCard: React.FC<EvidenceCardProps> = ({
  violation,
  onVerifyHash,
  isVerifying = false,
}) => {
  const [hasError, setHasError] = useState<boolean>(false);

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <ViolationTypeBadge type={violation.type} />
        <span className="text-xs text-gray-500">
          {new Date(violation.createdAt).toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })}{" "}
          WIB
        </span>
      </div>

      {/* Snapshot Preview menggunakan Next.js Image */}
      <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-gray-100 bg-gray-900 flex items-center justify-center">
        {!violation.fileUrl || hasError ? (
          <div className="flex flex-col items-center gap-1.5 text-gray-400">
            <ImageOff className="size-6 text-gray-500" />
            <span className="text-[11px]">Snapshot bukti tidak tersedia</span>
          </div>
        ) : (
          <Image
            src={violation.fileUrl}
            alt={`Bukti insiden ${violation.type}`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover"
            unoptimized={
              violation.fileUrl.startsWith("data:") ||
              violation.fileUrl.startsWith("blob:")
            }
            onError={() => setHasError(true)}
          />
        )}
      </div>

      {/* Metadata Environment */}
      <div className="rounded-lg bg-gray-50 p-2.5 text-xs text-gray-600">
        <p className="font-semibold text-gray-800">Detail Lingkungan:</p>
        <div className="mt-1 space-y-0.5">
          {Object.entries(violation.metadata || {}).map(([key, val]) => (
            <p key={key} className="truncate">
              <span className="font-mono text-gray-500">{key}:</span>{" "}
              {String(val)}
            </p>
          ))}
        </div>
      </div>

      {/* Checksum SHA-256 & Audit Integrity Action */}
      <div className="mt-1 flex items-center justify-between gap-2 border-t border-gray-100 pt-2 text-xs">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] uppercase font-semibold text-gray-400">
            SHA-256 Checksum
          </p>
          <p className="truncate font-mono text-gray-700">
            {violation.sha256Hash}
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          color="primary"
          leftIcon={ShieldCheck}
          loading={isVerifying}
          disabled={isVerifying}
          onClick={() => onVerifyHash(violation.id)}
          className="h-7 shrink-0 text-[11px]"
        >
          Audit Keaslian
        </Button>
      </div>
    </div>
  );
};
