//Files: src/sections/exam-monitoring/atoms/StatusBadge.tsx
"use client";

import type React from "react";
import type {AttemptStatus} from "@/modules/exam-monitoring/domain/entity/ExamAttemptEntity";
import Badge, {type BadgeColor, type BadgeVariant} from "@/shared-ui/component/Badge";

interface StatusBadgeProps {
    readonly status: AttemptStatus;
    readonly isLocked: boolean;
    readonly variant?: BadgeVariant;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
                                                            status,
                                                            isLocked,
                                                            variant = "soft",
                                                        }) => {
    if (isLocked || status === "LOCKED") {
        return (
            <Badge color="warning" variant={variant} size="md">
                LOCKED 🔒
            </Badge>
        );
    }

    switch (status) {
        case "IN_PROGRESS":
            return (
                <Badge color="success" variant={variant} size="md">
                    IN PROGRESS 🟢
                </Badge>
            );
        case "DISQUALIFIED":
            return (
                <Badge color="danger" variant={variant} size="md">
                    DISQUALIFIED ❌
                </Badge>
            );
        case "COMPLETED":
            return (
                <Badge color="info" variant={variant} size="md">
                    COMPLETED ✅
                </Badge>
            );
        default: {
            const fallbackColor: BadgeColor = "gray";
            return (
                <Badge color={fallbackColor} variant={variant} size="md">
                    {status}
                </Badge>
            );
        }
    }
};