/** @scopeDefault * */
import { Product } from '_shared/api/product/types';

const PRODUCT_COUNT = 1000;
const PRODUCT_IMAGE_CDN = 'https://moqimg.ru';

type ProductTemplate = Pick<Product, 'name' | 'category'> & {
  basePrice: number;
  imageSeed: string;
};

const IMAGE_SIZE_OFFSET_BY_SEED: Record<ProductTemplate['imageSeed'], number> = {
  airpods: 0,
  iphone: 8,
  sony: 16,
  watch: 24,
  dyson: 32,
};

function buildProductImageUrl(imageSeed: string): string {
  const size = 400 + (IMAGE_SIZE_OFFSET_BY_SEED[imageSeed] ?? 0);

  return `${PRODUCT_IMAGE_CDN}/${size}x${size}.webp`;
}

const templates: Array<ProductTemplate> = [
  {
    name: 'AirPods Pro',
    category: 'Беспроводные наушники',
    basePrice: 89,
    imageSeed: 'airpods',
  },
  {
    name: 'iPhone 15 128GB',
    category: 'Смартфон',
    basePrice: 99,
    imageSeed: 'iphone',
  },
  {
    name: 'Sony WH-1000XM5',
    category: 'Наушники',
    basePrice: 79,
    imageSeed: 'sony',
  },
  {
    name: 'Apple Watch Series 9',
    category: 'Умные часы',
    basePrice: 95,
    imageSeed: 'watch',
  },
  {
    name: 'Dyson V15 Detect',
    category: 'Пылесос',
    basePrice: 85,
    imageSeed: 'dyson',
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
    const priceOffset = Math.floor(random() * 500) - 10;
    const price = Math.min(1000, Math.max(1, template.basePrice + priceOffset));
    const stock = Math.floor(random() * 11);

    return {
      id: String(index + 1),
      name: generateProductName(template, index, random),
      category: template.category,
      price,
      image: buildProductImageUrl(template.imageSeed),
      stock,
    };
  });
}

export const productList: Array<Product> = generateProductList(PRODUCT_COUNT);
