/** @scopeDefault * */
export const ORDER_ERROR_CODES = {
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
} as const;

export type OrderErrorCode = (typeof ORDER_ERROR_CODES)[keyof typeof ORDER_ERROR_CODES];

export class OrderApiError extends Error {
  readonly code: OrderErrorCode;

  constructor(code: OrderErrorCode, message: string) {
    super(message);
    this.name = 'OrderApiError';
    this.code = code;
  }
}
