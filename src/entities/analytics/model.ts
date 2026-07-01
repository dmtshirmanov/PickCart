/** @scopeDefault * */
import { makeAutoObservable, runInAction } from 'mobx';
import { analyticsService } from '_shared/api/analytics/service';
import {
  AnalyticsDeliveryStatus,
  AnalyticsEvent,
  type AnalyticsEventPayload,
  type AnalyticsEventRequest,
  type AnalyticsLogEntry,
} from '_shared/api/analytics/types';

type QueuedAnalyticsEvent<T extends AnalyticsEvent = AnalyticsEvent> = AnalyticsEventRequest<T> & {
  id: string;
};

let entryIdSequence = 0;

function createLogEntryId() {
  entryIdSequence += 1;
  return `analytics-${Date.now()}-${entryIdSequence}`;
}

class AnalyticsStore {
  log: Array<AnalyticsLogEntry> = [];

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
    const timestamp = Date.now();
    const id = createLogEntryId();

    runInAction(() => {
      this.log.unshift({
        id,
        event,
        payload,
        timestamp,
        status: AnalyticsDeliveryStatus.PENDING,
      });
    });

    this.enqueue({
      id,
      event,
      payload,
      timestamp,
    });
  }

  private enqueue(event: QueuedAnalyticsEvent) {
    this.queue.push(event);
    this.processQueue();
  }

  private updateLogEntry(id: string, status: AnalyticsDeliveryStatus, errorMessage?: string) {
    const index = this.log.findIndex(item => item.id === id);

    if (index === -1) {
      return;
    }

    const entry = this.log[index]!;

    this.log[index] = {
      ...entry,
      status,
      errorMessage,
    };
  }

  get logRevision() {
    return this.log.map(entry => `${entry.id}:${entry.status}`).join('|');
  }

  private async processQueue() {
    if (this.isProcessing) {
      return;
    }

    this.isProcessing = true;

    while (this.queue.length > 0) {
      const { id, ...request } = this.queue.shift()!;

      try {
        await analyticsService.send(request);
        runInAction(() => {
          this.updateLogEntry(id, AnalyticsDeliveryStatus.SUCCESS);
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Не удалось отправить событие';
        console.error('[analytics] error', message);
        runInAction(() => {
          this.updateLogEntry(id, AnalyticsDeliveryStatus.FAILED, message);
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
