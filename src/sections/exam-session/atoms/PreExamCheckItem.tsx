//Files: src/sections/exam-session/atoms/PreExamCheckItem.tsx
"use client";

import type {LucideIcon} from "lucide-react";
import type React from "react";

interface PreExamCheckItemProps {
  readonly icon: LucideIcon;
  readonly title: string;
  readonly description: string;
}

export const PreExamCheckItem: React.FC<PreExamCheckItemProps> = ({
  icon: Icon,
  title,
  description,
}) => (
  <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3.5">
    <Icon className="size-5 shrink-0 text-indigo-600 mt-0.5" />
    <div>
      <p className="font-semibold text-slate-800">{title}</p>
      <p className="text-slate-500 text-xs">{description}</p>
    </div>
  </div>
);
