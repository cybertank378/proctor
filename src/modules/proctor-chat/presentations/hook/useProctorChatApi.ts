//Files: src/modules/proctor-chat/presentations/hook/useProctorChatApi.ts
"use client";

import { useCallback, useState } from "react";
import { showErrorToast } from "@/shared-ui/component/Toast";
import type { SendChatMessageRequestDto } from "../../domain/dto/ChatRequestDto";
import type { ChatMessageDto } from "../../domain/dto/ChatResponseDto";

interface ApiResponse<T> {
  readonly success: boolean;
  readonly message?: string;
  readonly data?: T;
  readonly error?: string;
}

export function useProctorChatApi() {
  const [messages, setMessages] = useState<readonly ChatMessageDto[]>([]);
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchMessages = useCallback(
    async (quizId: number, roomNumber?: string): Promise<void> => {
      setLoading(true);
      try {
        const token = sessionStorage.getItem("proctor_access_token");
        const url = new URL("/api/chat/messages", window.location.origin);
        url.searchParams.set("quizId", String(quizId));
        if (roomNumber) {
          url.searchParams.set("roomNumber", roomNumber);
        }

        const res = await fetch(url.toString(), {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json: ApiResponse<readonly ChatMessageDto[]> = await res.json();

        if (res.ok && json.success && json.data) {
          setMessages(json.data);
        } else {
          showErrorToast(
            json.message || json.error || "Gagal memuat riwayat obrolan.",
          );
        }
      } catch {
        showErrorToast("Kesalahan jaringan saat memuat pesan chat.");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const sendMessage = useCallback(
    async (payload: SendChatMessageRequestDto): Promise<boolean> => {
      setSending(true);
      try {
        const token = sessionStorage.getItem("proctor_access_token");
        const res = await fetch("/api/chat/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        const json: ApiResponse<ChatMessageDto> = await res.json();

        if (res.ok && json.success && json.data) {
          const sentMessage = json.data;
          setMessages((prev) => [...prev, sentMessage]);
          return true;
        }

        showErrorToast(
          json.error || json.message || "Pesan chat gagal terkirim.",
        );
        return false;
      } catch {
        showErrorToast("Gagal terhubung ke server koordinasi pengawas.");
        return false;
      } finally {
        setSending(false);
      }
    },
    [],
  );

  return {
    messages,
    sending,
    loading,
    fetchMessages,
    sendMessage,
  };
}
