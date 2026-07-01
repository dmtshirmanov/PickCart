/** @scopeDefault * */
import { makeAutoObservable, runInAction } from 'mobx';
import { analyticsService } from '_shared/api/analytics/service';
import {
  AnalyticsEvent,
  type AnalyticsEventPayload,
  type AnalyticsEventRequest,
} from '_shared/api/analytics/types';

type QueuedAnalyticsEvent<T extends AnalyticsEvent = AnalyticsEvent> = AnalyticsEventRequest<T>;

class AnalyticsStore {
  private queue: Array<QueuedAnalyticsEvent> = [];
  private isProcessing = false;

  constructor() {
    makeAutoObservable(this);
  }

  reportEvent<T extends AnalyticsEvent>(
    event: T,
    ...attributes: AnalyticsEventPayload[T] extends never ? [never?] : [AnalyticsEventPayload[T]]
  ) {
    const payload = attributes[0] as AnalyticsEventPayload[T];

    this.enqueue({
      event,
      payload,
      timestamp: Date.now(),
    });
  }

  private enqueue(event: QueuedAnalyticsEvent) {
    this.queue.push(event);
    this.processQueue();
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
      } catch (error) {
        // TODO(analytics-retry): повторная отправка должна жить в HTTP-слое, не в store.
        // Кейс: analyticsService.send() отклоняется с SERVICE_UNAVAILABLE (сеть/5xx).
        // Интерцептор делает до 3 попыток с backoff, store держит событие в очереди до финального отказа.
        // После исчерпания попыток console.error + опционально offline-буфер (AsyncStorage).
        const message = error instanceof Error ? error.message : 'Не удалось отправить событие';
        console.error('[analytics] error', message);
      }
    }

    runInAction(() => {
      this.isProcessing = false;
    });
  }
}

/** @scope * */
export const analyticsStore = new AnalyticsStore();
