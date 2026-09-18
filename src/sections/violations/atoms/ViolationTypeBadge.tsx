//Files: src/sections/violations/atoms/ViolationTypeBadge.tsx
"use client";

import type React from "react";
import type {ViolationType} from "@/modules/violations/domain/entity/ViolationRecordEntity";
import Badge, {type BadgeColor} from "@/shared-ui/component/Badge";

interface ViolationTypeBadgeProps {
    readonly type: ViolationType;
}

const TYPE_CONFIG: Record<ViolationType, { label: string; color: BadgeColor }> = {
    TAB_SWITCH: { label: "Pindah Tab / Minimize", color: "warning" },
    WINDOW_BLUR: { label: "Kehilangan Fokus Jendela", color: "warning" },
    DEVTOOLS_OPEN: { label: "Inspect Element / DevTools", color: "danger" },
    RESTRICTED_KEY: { label: "Shortcut Terlarang", color: "danger" },
    MULTI_MONITOR: { label: "Layar Tambahan", color: "danger" },
};

export const ViolationTypeBadge: React.FC<ViolationTypeBadgeProps> = ({ type }) => {
    const config = TYPE_CONFIG[type] ?? { label: type, color: "gray" };

    return (
        <Badge color={config.color} variant="soft" size="md">
            {config.label}
        </Badge>
    );
};