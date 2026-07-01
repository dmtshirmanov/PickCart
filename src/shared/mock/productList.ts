/** @scopeDefault * */
import { Product } from '_shared/api/product/types';

const PRODUCT_COUNT = 1000;

type ProductTemplate = Pick<Product, 'name' | 'category' | 'image'> & { basePrice: number };

const templates: Array<ProductTemplate> = [
  {
    name: 'AirPods Pro',
    category: 'Беспроводные наушники',
    basePrice: 89,
    image:
      'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/MQD83?wid=2000&hei=2000&fmt=jpeg&qlt=90&.v=1660803972361',
  },
  {
    name: 'iPhone 15 128GB',
    category: 'Смартфон',
    basePrice: 99,
    image:
      'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-finish-select-202309-6-1inch-blue?wid=2000&hei=2000&fmt=jpeg&qlt=90&.v=1693009279823',
  },
  {
    name: 'Sony WH-1000XM5',
    category: 'Наушники',
    basePrice: 79,
    image:
      'https://sony.scene7.com/is/image/sonyglobalsolutions/wh-1000xm5_Primary_image?$primaryshotPreset$&fmt=png-alpha&wid=2000',
  },
  {
    name: 'Apple Watch Series 9',
    category: 'Умные часы',
    basePrice: 95,
    image:
      'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/watch-s9-45mm-pink-sport-band-s9?wid=2000&hei=2000&fmt=jpeg&qlt=90&.v=1693304428668',
  },
  {
    name: 'Dyson V15 Detect',
    category: 'Пылесос',
    basePrice: 85,
    image:
      'https://dyson-h.assetsadobe2.com/is/image/content/dam/dyson/images/products/primary/447110-01.png',
  },
];

const brands = [
  'Apple',
  'Sony',
  'Samsung',
  'Dyson',
  'Xiaomi',
  'Huawei',
  'Bose',
  'JBL',
  'LG',
  'Philips',
];
const modifiers = ['Pro', 'Ultra', 'Plus', 'Max', 'Mini', 'Lite', 'SE', 'Elite', 'Air', 'Neo'];
const colors = [
  'Black',
  'White',
  'Blue',
  'Silver',
  'Gold',
  'Pink',
  'Green',
  'Graphite',
  'Titanium',
  'Red',
];
const storage = ['64GB', '128GB', '256GB', '512GB', '1TB'];
const editions = ['2023', '2024', '2025', 'Gen 2', 'Gen 3', 'Special Edition'];

function createSeededRandom(seed: number) {
  let state = seed;

  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

function pick<T>(items: Array<T>, random: () => number): T {
  return items[Math.floor(random() * items.length)]!;
}

function generateProductName(
  template: ProductTemplate,
  index: number,
  random: () => number,
): string {
  if (index < templates.length) {
    return template.name;
  }

  const parts = [
    pick(brands, random),
    pick(modifiers, random),
    template.category.split(' ')[0],
    pick(colors, random),
    pick(storage, random),
    pick(editions, random),
  ];

  const nameLength = 3 + Math.floor(random() * 3);
  const shuffled = parts.sort(() => random() - 0.5);

  return shuffled.slice(0, nameLength).join(' ');
}

function generateProductList(count: number): Array<Product> {
  const random = createSeededRandom(42);

  return Array.from({ length: count }, (_, index) => {
    const template = templates[index % templates.length]!;
    const priceOffset = Math.floor(random() * 21) - 10;
    const price = Math.min(200, Math.max(1, template.basePrice + priceOffset));

    return {
      id: String(index + 1),
      name: generateProductName(template, index, random),
      category: template.category,
      price,
      image: template.image,
    };
  });
}

export const productList: Array<Product> = generateProductList(PRODUCT_COUNT);
