"use client";

import React, { useEffect, useState } from "react";

interface StreamFrame {
  attemptRecordId: string;
  quizId: number;
  userId: number;
  imagePath: string;
  isSuspicious: boolean;
  timestamp: string;
}

export function useLiveProctoring(quizId?: number) {
  const [frames, setFrames] = useState<Record<string, StreamFrame>>({});
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!quizId) return;

    let eventSource: EventSource | null = null;
    let reconnectTimeout: NodeJS.Timeout;

    const connect = () => {
      eventSource = new EventSource(`/api/proctoring/stream?quizId=${quizId}`);

      eventSource.onopen = () => {
        setIsConnected(true);
      };

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "FRAME" && data.data) {
            const frame = data.data as StreamFrame;
            setFrames((prev) => ({
              ...prev,
              [frame.attemptRecordId]: frame,
            }));
          }
        } catch (error) {
          console.error("Error parsing SSE data", error);
        }
      };

      eventSource.onerror = () => {
        setIsConnected(false);
        eventSource?.close();
        reconnectTimeout = setTimeout(connect, 3000);
      };
    };

    connect();

    return () => {
      eventSource?.close();
      clearTimeout(reconnectTimeout);
    };
  }, [quizId]);

  return { frames, isConnected };
}
