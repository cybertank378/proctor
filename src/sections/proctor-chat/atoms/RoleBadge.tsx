//Files: src/sections/proctor-chat/atoms/RoleBadge.tsx
"use client";

import type React from "react";
import type {ProctorRole} from "@/modules/auth/domain/entity/ProctorUserEntity";
import Badge, {type BadgeColor, type BadgeSize, type BadgeVariant} from "@/shared-ui/component/Badge";

export interface RoleBadgeProps {
    readonly role: ProctorRole;
    readonly variant?: BadgeVariant;
    readonly size?: BadgeSize;
    readonly className?: string;
}

interface RoleConfig {
    readonly label: string;
    readonly color: BadgeColor;
}

const ROLE_CONFIG: Record<ProctorRole, RoleConfig> = {
    CHIEF_PROCTOR: {
        label: "Ketua Pengawas",
        color: "primary",
    },
    PROCTOR: {
        label: "Pengawas Ruangan",
        color: "secondary",
    },
};

export const RoleBadge: React.FC<RoleBadgeProps> = ({
                                                        role,
                                                        variant = "solid",
                                                        size = "sm",
                                                        className,
                                                    }) => {
    const config = ROLE_CONFIG[role] ?? {
        label: role,
        color: "gray" as BadgeColor,
    };

    return (
        <Badge
            color={config.color}
            variant={variant}
            size={size}
            className={className}
            data-testid="role-badge"
        >
            {config.label}
        </Badge>
    );
};