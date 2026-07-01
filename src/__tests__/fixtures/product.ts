import { OrderProduct } from '_shared/api/order/types';
import { Product } from '_shared/api/product/types';

export function createProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: 'product-1',
    name: 'Test Product',
    category: 'Test',
    price: 100,
    image: 'https://example.com/image.jpg',
    stock: 5,
    ...overrides,
  };
}

export function createOrderProduct(overrides: Partial<OrderProduct> = {}): OrderProduct {
  const { quantity = 1, ...productOverrides } = overrides;

  return {
    ...createProduct(productOverrides),
    quantity,
  };
}
