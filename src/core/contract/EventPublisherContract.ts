//Files: src/core/contract/EventPublisherContract.ts
export interface DomainEvent<T = unknown> {
  readonly eventName: string;
  readonly occurredOn: Date;
  readonly payload: T;
}

export type EventSubscriber<T = unknown> = (
  event: DomainEvent<T>,
) => Promise<void> | void;

export interface EventPublisherContract {
  /**
   * Menerbitkan domain event secara asynchronous ke seluruh subscriber
   */
  publish<T>(event: DomainEvent<T>): Promise<void>;

  /**
   * Mendaftarkan subscriber untuk event tertentu.
   * Mengembalikan callback fungsi untuk membatalkan langganan (unsubscribe).
   */
  subscribe<T>(eventName: string, handler: EventSubscriber<T>): () => void;
}
