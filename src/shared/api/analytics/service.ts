/** @scopeDefault * */
import { simulateResponse } from '../mock/simulateResponse';
import { ANALYTICS_ERROR_CODES, AnalyticsApiError } from './errors';
import type { AnalyticsEvent, AnalyticsEventRequest } from './types';

const SEND_DELAY_MS = 400;
const FAILURE_RATE = 0.4;

const SERVICE_UNAVAILABLE_ERROR = new AnalyticsApiError(
  ANALYTICS_ERROR_CODES.SERVICE_UNAVAILABLE,
  'Сервис аналитики временно недоступен',
);

class AnalyticsService {
  async send<T extends AnalyticsEvent>(request: AnalyticsEventRequest<T>): Promise<void> {
    await simulateResponse(() => undefined, {
      delayMs: SEND_DELAY_MS,
      failureRate: FAILURE_RATE,
      errors: [SERVICE_UNAVAILABLE_ERROR],
    });

    console.info('[analytics] sent', request.event, request.payload);
  }
}

export const analyticsService = new AnalyticsService();
