// Files: src/sections/proctor-chat/organisms/ProctorChatPanel.tsx
"use client";

import { DoorOpen, Hash, RefreshCw, Send } from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useProctorChatApi } from "@/modules/proctor-chat/presentations/hook/useProctorChatApi";
import Button from "@/shared-ui/component/Button";
import TextField from "@/shared-ui/component/TextField";
import { ChatMessageBubble } from "../molecules/ChatMessageBubble";

export interface ProctorChatPanelProps {
  readonly defaultQuizId?: number;
  readonly defaultRoomNumber?: string;
  readonly pollIntervalMs?: number;
  readonly className?: string;
  readonly onNewMessage?: (totalMessages: number) => void;
}

interface CurrentUserSession {
  readonly id?: string;
  readonly username?: string;
  readonly fullName?: string;
}

export const ProctorChatPanel: React.FC<ProctorChatPanelProps> = ({
  defaultQuizId,
  defaultRoomNumber = "",
  pollIntervalMs = 5000,
  className,
  onNewMessage,
}) => {
  const { messages, sending, loading, fetchMessages, sendMessage } =
    useProctorChatApi();

  const [quizIdInput, setQuizIdInput] = useState<string>(
    defaultQuizId ? String(defaultQuizId) : "",
  );
  const [roomFilter, setRoomFilter] = useState<string>(defaultRoomNumber);
  const [messageText, setMessageText] = useState<string>("");

  const chatBottomRef = useRef<HTMLDivElement | null>(null);
  const prevMessagesCountRef = useRef<number>(messages.length);

  // Sinkronkan state lokal saat props defaultQuizId berubah dinamis
  useEffect(() => {
    if (defaultQuizId && defaultQuizId > 0) {
      setQuizIdInput(String(defaultQuizId));
    }
  }, [defaultQuizId]);

  // Sinkronkan state lokal saat props defaultRoomNumber berubah dinamis
  useEffect(() => {
    setRoomFilter(defaultRoomNumber);
  }, [defaultRoomNumber]);

  const currentUser = useMemo<CurrentUserSession>(() => {
    if (typeof window === "undefined") {
      return {};
    }
    try {
      const rawUser = sessionStorage.getItem("proctor_user");
      return rawUser ? (JSON.parse(rawUser) as CurrentUserSession) : {};
    } catch {
      return {};
    }
  }, []);

  const parsedQuizId = useMemo<number | null>(() => {
    const parsed = Number(quizIdInput);
    if (Number.isInteger(parsed) && parsed > 0) {
      return parsed;
    }
    if (defaultQuizId && defaultQuizId > 0) {
      return defaultQuizId;
    }
    return null;
  }, [quizIdInput, defaultQuizId]);

  const loadChat = useCallback(() => {
    if (parsedQuizId && parsedQuizId > 0) {
      void fetchMessages(parsedQuizId, roomFilter.trim() || undefined);
    }
  }, [parsedQuizId, roomFilter, fetchMessages]);

  useEffect(() => {
    if (!parsedQuizId) return;

    loadChat();
    const interval = setInterval(loadChat, pollIntervalMs);
    return () => clearInterval(interval);
  }, [loadChat, pollIntervalMs, parsedQuizId]);

  // Scroll otomatis dan trigger callback notifikasi pesan baru saat jumlah pesan bertambah
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage) {
      chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });

      if (messages.length > prevMessagesCountRef.current) {
        onNewMessage?.(messages.length);
      }
    }
    prevMessagesCountRef.current = messages.length;
  }, [messages, onNewMessage]);

  const handleSend = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const normalizedContent = messageText.trim();
    if (!normalizedContent || sending || !parsedQuizId) {
      return;
    }

    const isSuccess = await sendMessage({
      quizId: parsedQuizId,
      roomNumber: roomFilter.trim() || null,
      content: normalizedContent,
    });

    if (isSuccess) {
      setMessageText("");
    }
  };

  return (
    <div
      data-testid="proctor-chat-panel"
      className={`flex h-[calc(100vh-12rem)] flex-col rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden ${
        className ?? ""
      }`}
    >
      {/* Header & Filter Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 bg-gray-50/70 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="w-36">
            <TextField
              size="sm"
              variant="outlined"
              placeholder="Quiz ID"
              leftIcon={Hash}
              type="number"
              value={quizIdInput}
              onChange={(e) => setQuizIdInput(e.target.value)}
              data-testid="chat-quiz-id-input"
            />
          </div>
          <div className="w-48">
            <TextField
              size="sm"
              variant="outlined"
              placeholder="Ruangan (All jika kosong)"
              leftIcon={DoorOpen}
              value={roomFilter}
              onChange={(e) => setRoomFilter(e.target.value)}
              data-testid="chat-room-filter-input"
            />
          </div>
        </div>

        <Button
          size="sm"
          variant="outline"
          color="secondary"
          leftIcon={RefreshCw}
          loading={loading}
          disabled={!parsedQuizId}
          onClick={loadChat}
          className="h-9 px-3 text-xs"
          data-testid="chat-refresh-button"
        >
          Muat Ulang
        </Button>
      </div>

      {/* Message Stream Area */}
      <div
        data-testid="chat-stream-container"
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30"
      >
        {!parsedQuizId ? (
          <div
            data-testid="chat-unselected-state"
            className="py-12 text-center text-sm text-gray-400"
          >
            Tentukan Quiz ID untuk melihat obrolan.
          </div>
        ) : loading && messages.length === 0 ? (
          <div
            data-testid="chat-loading-state"
            className="py-12 text-center text-sm text-gray-400"
          >
            Menghubungkan ke saluran obrolan pengawas...
          </div>
        ) : messages.length === 0 ? (
          <div
            data-testid="chat-empty-state"
            className="py-12 text-center text-sm text-gray-400"
          >
            Belum ada pesan koordinasi pada kuis ini.
          </div>
        ) : (
          messages.map((msg) => (
            <ChatMessageBubble
              key={msg.id}
              message={msg}
              isSelf={Boolean(
                currentUser.id && msg.senderId === currentUser.id,
              )}
            />
          ))
        )}
        <div ref={chatBottomRef} data-testid="chat-bottom-anchor" />
      </div>

      {/* Chat Input & Send Form */}
      <form
        onSubmit={handleSend}
        className="flex items-center gap-2 border-t border-gray-200 bg-white p-3"
      >
        <div className="flex-1">
          <TextField
            size="md"
            variant="outlined"
            placeholder={
              parsedQuizId
                ? "Ketik pesan koordinasi pengawas..."
                : "Pilih Quiz ID terlebih dahulu..."
            }
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            maxLengthValue={500}
            disabled={sending || !parsedQuizId}
            data-testid="chat-message-input"
          />
        </div>

        <Button
          type="submit"
          color="primary"
          size="md"
          variant="filled"
          leftIcon={Send}
          loading={sending}
          disabled={sending || !messageText.trim() || !parsedQuizId}
          className="h-11 px-5 rounded-lg font-semibold shrink-0"
          data-testid="chat-send-button"
        >
          Kirim
        </Button>
      </form>
    </div>
  );
};
