import { formatItemsCount, formatPrice } from '_shared/utils/format';

describe('format', () => {
  test('formatPrice formats integer in rubles', () => {
    const price = 100;

    expect(formatPrice(price)).toBe(`${price.toLocaleString('ru-RU')} ₽`);
  });

  test('formatPrice formats thousands with grouping', () => {
    const price = 1500;

    expect(formatPrice(price)).toBe(`${price.toLocaleString('ru-RU')} ₽`);
  });

  test('formatItemsCount pluralizes correctly', () => {
    expect(formatItemsCount(1)).toBe('1 товар');
    expect(formatItemsCount(21)).toBe('21 товар');
    expect(formatItemsCount(101)).toBe('101 товар');

    expect(formatItemsCount(2)).toBe('2 товара');
    expect(formatItemsCount(3)).toBe('3 товара');
    expect(formatItemsCount(4)).toBe('4 товара');
    expect(formatItemsCount(22)).toBe('22 товара');

    expect(formatItemsCount(5)).toBe('5 товаров');
    expect(formatItemsCount(11)).toBe('11 товаров');
    expect(formatItemsCount(12)).toBe('12 товаров');
    expect(formatItemsCount(19)).toBe('19 товаров');
    expect(formatItemsCount(25)).toBe('25 товаров');
    expect(formatItemsCount(111)).toBe('111 товаров');
  });
});
