export function formatPrice(price: number) {
  return `${price.toLocaleString('ru-RU')} ₽`;
}

export function formatItemsCount(count: number) {
  const mod10 = count % 10;
  const mod100 = count % 100;

  if (mod100 >= 11 && mod100 <= 19) {
    return `${count} товаров`;
  }
  if (mod10 === 1) {
    return `${count} товар`;
  }
  if (mod10 >= 2 && mod10 <= 4) {
    return `${count} товара`;
  }
  return `${count} товаров`;
}
