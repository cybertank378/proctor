//Files: src/sections/exam-monitoring/molecules/MetricCard.tsx
import type React from "react";

interface MetricCardProps {
  readonly title: string;
  readonly value: number | string;
  readonly variant?: "default" | "warning" | "danger" | "success";
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  variant = "default",
}) => {
  const colorClasses = {
    default: "bg-white border-slate-200 text-slate-950",
    warning: "bg-amber-50/50 border-amber-200 text-amber-950",
    danger: "bg-red-50/50 border-red-200 text-red-950",
    success: "bg-emerald-50/50 border-emerald-200 text-emerald-950",
  }[variant];

  return (
    <div className={`rounded-2xl border p-5 shadow-sm ${colorClasses}`}>
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <p className="mt-2 text-3xl font-extrabold tracking-tight">{value}</p>
    </div>
  );
};
