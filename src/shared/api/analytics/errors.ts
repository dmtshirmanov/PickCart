export const ANALYTICS_ERROR_CODES = {
    SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
} as const;

export type AnalyticsErrorCode = (typeof ANALYTICS_ERROR_CODES)[keyof typeof ANALYTICS_ERROR_CODES];

export class AnalyticsApiError extends Error {
    readonly code: AnalyticsErrorCode;

    constructor(code: AnalyticsErrorCode, message: string) {
        super(message);
        this.name = 'AnalyticsApiError';
        this.code = code;
    }
}
