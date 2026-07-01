/** @scopeDefault * */
import { makeAutoObservable, runInAction } from 'mobx';
import { analyticsService } from '_shared/api/analytics/service';
import {
  AnalyticsEvent,
  type AnalyticsDeliveryRecord,
  type AnalyticsEventPayload,
  type AnalyticsEventRequest,
} from '_shared/api/analytics/types';

type QueuedAnalyticsEvent<T extends AnalyticsEvent = AnalyticsEvent> = AnalyticsEventRequest<T>;

class AnalyticsStore {
  lastDelivery?: AnalyticsDeliveryRecord;

  private queue: QueuedAnalyticsEvent[] = [];
  private isProcessing = false;

  constructor() {
    makeAutoObservable(this);
  }

  reportEvent<T extends AnalyticsEvent>(
    event: T,
    ...attributes: AnalyticsEventPayload[T] extends never ? [never?] : [AnalyticsEventPayload[T]]
  ) {
    const payload = attributes[0] as AnalyticsEventPayload[T];

    void this.enqueue({
      event,
      payload,
      timestamp: Date.now(),
    });
  }

  private enqueue(event: QueuedAnalyticsEvent) {
    this.queue.push(event);
    void this.processQueue();
  }

  private async processQueue() {
    if (this.isProcessing) {
      return;
    }

    this.isProcessing = true;

    while (this.queue.length > 0) {
      const event = this.queue.shift()!;

      try {
        await analyticsService.send(event);

        runInAction(() => {
          this.lastDelivery = {
            event: event.event,
            success: true,
            sentAt: Date.now(),
          };
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Не удалось отправить событие';

        runInAction(() => {
          this.lastDelivery = {
            event: event.event,
            success: false,
            error: message,
          };
        });
      }
    }

    runInAction(() => {
      this.isProcessing = false;
    });
  }
}

/** @scope * */
export const analyticsStore = new AnalyticsStore();
