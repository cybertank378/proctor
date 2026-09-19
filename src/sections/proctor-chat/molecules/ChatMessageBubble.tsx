//Files: src/sections/proctor-chat/molecules/ChatMessageBubble.tsx
"use client";

import clsx from "clsx";
import {Radio} from "lucide-react";
import type React from "react";
import type {ChatMessageDto} from "@/modules/proctor-chat/domain/dto/ChatResponseDto";
import {RoleBadge} from "../atoms/RoleBadge";

export interface ChatMessageBubbleProps {
  readonly message: ChatMessageDto;
  readonly isSelf: boolean;
  readonly className?: string;
}

export const ChatMessageBubble: React.FC<ChatMessageBubbleProps> = ({
  message,
  isSelf,
  className,
}) => {
  const isBroadcast = message.roomNumber === null;

  const formattedTime = new Date(message.createdAt).toLocaleTimeString(
    "id-ID",
    {
      hour: "2-digit",
      minute: "2-digit",
    },
  );

  return (
    <div
      data-testid="chat-message-bubble-container"
      className={clsx(
        "flex flex-col gap-1 text-sm transition-all",
        isSelf ? "items-end" : "items-start",
        className,
      )}
    >
      {/* Header Info: Nama Pengirim, Role Badge, dan Target Ruang */}
      <div className="flex flex-wrap items-center gap-1.5 px-1 text-xs text-slate-500">
        <span
          data-testid="sender-name"
          className={clsx(
            "font-semibold",
            isSelf ? "text-indigo-900" : "text-slate-800",
          )}
        >
          {isSelf ? "Anda" : message.senderName}
        </span>

        <RoleBadge role={message.role} size="sm" />

        {isBroadcast ? (
          <span
            data-testid="broadcast-indicator"
            className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700 ring-1 ring-inset ring-amber-600/20"
          >
            <Radio className="size-3 shrink-0 text-amber-600" />
            <span>Siaran</span>
          </span>
        ) : (
          <span
            data-testid="room-indicator"
            className="text-[11px] font-medium text-slate-400"
          >
            ({message.roomNumber})
          </span>
        )}
      </div>

      {/* Bubble Konten Pesan */}
      <div
        data-testid="chat-bubble-box"
        className={clsx(
          "max-w-md px-4 py-2.5 shadow-sm wrap-break-word leading-relaxed",
          isSelf
            ? "rounded-2xl rounded-tr-xs bg-indigo-600 text-white"
            : "rounded-2xl rounded-tl-xs border border-slate-200 bg-white text-slate-800",
        )}
      >
        <p className="whitespace-pre-wrap text-sm">{message.content}</p>
      </div>

      {/* Cap Waktu Pengiriman */}
      <span
        data-testid="message-timestamp"
        className="px-1 text-[10px] font-medium text-slate-400"
      >
        {formattedTime} WIB
      </span>
    </div>
  );
};
