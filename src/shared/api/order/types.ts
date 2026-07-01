/** @scopeDefault * */
import { OrderOptionKey } from '_entities/order/model';
import { Product } from '../product/types';

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

export type OrderProduct = Product & {
  quantity: number;
};

export interface Order {
  id: string;
  products: OrderProduct[];
  totalPrice: number;
  options: Record<OrderOptionKey, boolean>;
  status: OrderStatus;
}
