//Files: src/sections/exam-session/atoms/IntegrityBadge.tsx
"use client";

import { ShieldAlert, ShieldCheck } from "lucide-react";
import type React from "react";
import Badge from "@/shared-ui/component/Badge";

interface IntegrityBadgeProps {
  readonly violationCount: number;
  readonly maxViolations: number;
}

export const IntegrityBadge: React.FC<IntegrityBadgeProps> = ({
  violationCount,
  maxViolations,
}) => {
  const isNearLimit = violationCount >= maxViolations - 1;

  return (
    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
      <div className="flex items-center gap-1.5">
        {violationCount > 0 ? (
          <ShieldAlert className="size-4 text-amber-500 animate-pulse" />
        ) : (
          <ShieldCheck className="size-4 text-emerald-500" />
        )}
        <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
          Pengawasan
        </span>
      </div>
      <Badge
        size="sm"
        variant="soft"
        color={
          violationCount === 0 ? "success" : isNearLimit ? "danger" : "warning"
        }
      >
        {violationCount}/{maxViolations}
      </Badge>
    </div>
  );
};
