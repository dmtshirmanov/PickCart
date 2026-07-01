import { createProduct } from './product';

describe('createProduct', () => {
  test('returns defaults', () => {
    expect(createProduct()).toEqual({
      id: 'product-1',
      name: 'Test Product',
      category: 'Test',
      price: 100,
      image: 'https://example.com/image.jpg',
      stock: 5,
    });
  });

  test('applies overrides', () => {
    expect(createProduct({ id: 'custom', price: 250 })).toMatchObject({
      id: 'custom',
      price: 250,
    });
  });
});
