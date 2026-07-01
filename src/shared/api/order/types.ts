/** @scopeDefault * */
import { OrderOptionKey } from '_entities/order/model';
import { Product } from '../product/types';

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

export interface Order {
  id: string;
  products: Product[];
  totalPrice: number;
  options: Record<OrderOptionKey, boolean>;
  courierComment?: string;
  status: OrderStatus;
}
