import { EventEmitter } from "node:events";

interface StreamFrame {
  attemptRecordId: string;
  quizId: number;
  userId: number;
  imagePath: string;
  isSuspicious: boolean;
  timestamp: string;
}

const STREAM_EVENT = "new_frame";

class ProctoringStreamManager {
  private emitter: EventEmitter;

  constructor() {
    this.emitter = new EventEmitter();
    // Allow many concurrent clients (proctors) to subscribe
    this.emitter.setMaxListeners(100);
  }

  public pushFrame(frame: StreamFrame) {
    this.emitter.emit(STREAM_EVENT, frame);
  }

  public subscribe(
    callback: (frame: StreamFrame) => void,
    quizIdFilter?: number,
    roomFilter?: string
  ): () => void {
    const handler = (frame: StreamFrame) => {
      if (quizIdFilter && frame.quizId !== quizIdFilter) return;
      // You can add more filtering logic based on room if necessary
      callback(frame);
    };

    this.emitter.on(STREAM_EVENT, handler);

    // Return an unsubscribe function
    return () => {
      this.emitter.off(STREAM_EVENT, handler);
    };
  }
}

// Global instance to prevent memory leaks during hot reload in Next.js development
const globalForStream = global as unknown as {
  proctoringStreamManager: ProctoringStreamManager | undefined;
};

export const proctoringStreamManager =
  globalForStream.proctoringStreamManager ?? new ProctoringStreamManager();

if (process.env.NODE_ENV !== "production") {
  globalForStream.proctoringStreamManager = proctoringStreamManager;
}
