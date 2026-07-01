# PickCart

Тестовое React Native приложение — каталог товаров, корзина и оформление заказа с мок-бэкендом.

## Скриншоты

| Каталог | Корзина | Опции заказа |
|:---:|:---:|:---:|
| ![Каталог](docs/screenshots/catalog.png) | ![Корзина](docs/screenshots/cart.png) | ![Опции](docs/screenshots/order-options.png) |

| Подтверждение | Успех | Ошибка |
|:---:|:---:|:---:|
| ![Подтверждение](docs/screenshots/order-confirmation.png) | ![Успех](docs/screenshots/order-success.png) | ![Ошибка](docs/screenshots/error.png) |

## Функциональность

### Каталог
- 1000 товаров, подгрузка по 10 штук (`FlashList`)
- Pull-to-refresh, бесконечный скролл
- Добавление в корзину, изменение количества

### Корзина
- Список позиций, итоговая сумма
- Бейдж на табе с количеством товаров
- Минимальная сумма заказа с бэка (1000–2000 ₽, случайно)
- Блокировка оформления, если сумма ниже порога
- Персистентность корзины (`AsyncStorage`)

### Опции заказа
- 4 опции доставки (чекбоксы)
- Сохранение в `AsyncStorage`

### Оформление
- Экран подтверждения: товары, опции, итог
- Мок-бэкенд с задержкой и случайными ошибками
- Успех → экран «Спасибо за заказ», очистка корзины
- Ошибки → модальный `ErrorScreen`
- Смена мин. суммы на бэке → перезапрос порога, баннер на корзине

### Аналитика
- Типизированные события (`reportEvent<T>`)
- `CHECKOUT_STATE_CHANGED` через MobX `reaction` (debounce 300 ms)
- UI-события: checkout, открытие опций
- События заказа: submitted / confirmed / failed
- Очередь отправки, мок с `SERVICE_UNAVAILABLE`

### Инициализация
- `appInitStore` — централизованная загрузка данных при старте (сейчас: мин. сумма заказа)
- Экран загрузки до готовности, retry при ошибке init

## Стек

| Слой | Технологии |
|---|---|
| Framework | React Native 0.86, React 19 |
| Язык | TypeScript 5.8 |
| Стейт | MobX 6, mobx-react-lite, mobx-persist-store |
| Навигация | React Navigation 7 (tabs + native stack) |
| UI | react-native-unistyles, lucide-react-native |
| Списки | @shopify/flash-list |
| Хранение | @react-native-async-storage/async-storage |
| Архитектура | Feature-Sliced Design (app / screens / widgets / entities / shared) |
| Качество | ESLint, Prettier, Husky pre-commit (`npm run validate`) |

## Структура

```
src/
  app/           — App, навигация, global reactions
  screens/       — экраны (каталог, корзина, заказ, ошибки)
  widgets/       — TabBarNavigation
  entities/      — cart, order, product, analytics, app-init
  shared/        — api (моки), ui, config, lib
```

## Запуск

```sh
npm install
npm start          # Metro
npm run ios        # или npm run android
npm run validate   # typecheck + lint
```

## Мок-бэкенд

Все API в `src/shared/api/` — имитация через `simulateResponse`:
- задержка ~1 с
- ~35% вероятность ошибки (заказ, аналитика)

Минимальная сумма заказа при каждом запросе — случайное число от 1000 до 2000.
