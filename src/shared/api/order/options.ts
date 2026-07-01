/** @scopeDefault * */
export const ORDER_OPTION_LABELS = {
  leaveAtTheDoor: 'Оставить у двери',
  callForDelivery: 'Позвонить по доставке',
  checkCompleteness: 'Проверить комплектность',
} as const;

export type OrderOptionKey = keyof typeof ORDER_OPTION_LABELS;
