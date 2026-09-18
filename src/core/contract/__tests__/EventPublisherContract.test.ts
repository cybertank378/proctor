//Files: src/core/contract/__tests__/EventPublisherContract.test.ts
import {describe, expect, it, vi} from "vitest";
import type {DomainEvent, EventPublisherContract, EventSubscriber,} from "../EventPublisherContract";

interface StudentLockedEventPayload {
  readonly attemptId: number;
  readonly quizId: number;
  readonly roomNumber: string;
}

class InMemoryEventPublisher implements EventPublisherContract {
  private readonly subscribers = new Map<
    string,
    Set<EventSubscriber<unknown>>
  >();

  public subscribe<T>(
    eventName: string,
    handler: EventSubscriber<T>,
  ): () => void {
    if (!this.subscribers.has(eventName)) {
      this.subscribers.set(eventName, new Set());
    }

    const handlers = this.subscribers.get(eventName);
    const typedHandler = handler as EventSubscriber<unknown>;
    handlers?.add(typedHandler);

    return () => {
      handlers?.delete(typedHandler);
    };
  }

  public async publish<T>(event: DomainEvent<T>): Promise<void> {
    const handlers = this.subscribers.get(event.eventName);
    if (!handlers || handlers.size === 0) {
      return;
    }

    const promises = Array.from(handlers).map((handler) => handler(event));
    await Promise.all(promises);
  }
}

describe("EventPublisherContract", () => {
  it("harus menyebarkan event ke seluruh subscriber terdaftar dengan data payload yang tepat (AAA Pattern)", async () => {
    // Arrange
    const publisher: EventPublisherContract = new InMemoryEventPublisher();
    const eventHandler = vi.fn();
    const payload: StudentLockedEventPayload = {
      attemptId: 541,
      quizId: 101,
      roomNumber: "Lab 01",
    };
    const event: DomainEvent<StudentLockedEventPayload> = {
      eventName: "exam.student.locked",
      occurredOn: new Date(),
      payload,
    };

    publisher.subscribe<StudentLockedEventPayload>(
      "exam.student.locked",
      eventHandler,
    );

    // Act
    await publisher.publish(event);

    // Assert
    expect(eventHandler).toHaveBeenCalledTimes(1);
    expect(eventHandler).toHaveBeenCalledWith(event);
  });

  it("harus menghapus langganan subscriber saat fungsi unsubscribe dieksekusi (AAA Pattern)", async () => {
    // Arrange
    const publisher: EventPublisherContract = new InMemoryEventPublisher();
    const eventHandler = vi.fn();
    const event: DomainEvent<{ id: string }> = {
      eventName: "proctor.alert",
      occurredOn: new Date(),
      payload: { id: "alert-99" },
    };

    const unsubscribe = publisher.subscribe("proctor.alert", eventHandler);

    // Act
    unsubscribe();
    await publisher.publish(event);

    // Assert
    expect(eventHandler).not.toHaveBeenCalled();
  });
});
