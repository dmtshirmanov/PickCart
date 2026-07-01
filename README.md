# PickCart

Тестовое React Native приложение для работы с товарами и корзиной

## Скриншоты

| Каталог | Корзина | Подтверждение |
|:---:|:---:|:---:|
| ![Каталог](docs/screenshots/catalog.png) | ![Корзина](docs/screenshots/cart.png) | ![Подтверждение](docs/screenshots/order-confirmation.png) |

| Успех | Ошибка бронирования | Аналитика |
|:---:|:---:|:---:|
| ![Успех](docs/screenshots/order-success.png) | ![Ошибка бронирования](docs/screenshots/checkout-error.png) | ![Аналитика](docs/screenshots/analytics.png) |

## Функциональность

### Каталог
- 1000 товаров, подгрузка по 10 штук (`FlashList`)
- Pull-to-refresh, бесконечный скролл
- Добавление в корзину, изменение количества
- Отображение остатка, состояние «Раскупили» при

### Корзина
- Список позиций, итоговая сумма, лимит
- Бейдж на табе с количеством товаров
- Минимальная сумма заказа с бэка (1000–2000 ₽, случайно)
- Блокировка оформления, если корзина пуста или сумма ниже порога
- Персистентность корзины (`AsyncStorage`)
- Двухшаговое оформление: сначала бронирование (`reserve`), затем подтверждение
- Модалка ошибок бронирования: out of stock, урезание количества, смена мин. суммы
- Подсветка проблемных позиций после неуспешной брони
- Баннер активной брони с таймером и отменой
- Защита от изменения корзины при активной брони (Alert → снятие брони)

### Опции заказа
- 3 опции доставки (чекбоксы на экране подтверждения)
- Сохранение в `AsyncStorage`

### Оформление
- **Шаг 1 — бронирование** (`checkout`): проверка stock и мин. суммы, корректировка корзины
- **Шаг 2 — подтверждение**: товары, опции, итог, таймер брони (30 мин)
- **Шаг 3 — отправка** (`confirmOrder`): финальный запрос на бэкенд
- Успех → экран «Спасибо за заказ», очистка корзины и брони
- Ошибка confirm → `ErrorScreen`
- Истечение брони → alert и возврат в корзину

### Остатки (`stockById`)
- Единый `Map<productId, stock>` в `productStore`, персист в `AsyncStorage`
- Заполняется при загрузке каталога (`get` / `more` / `refresh`) и обновляется после бронирования
- UI и лимиты степпера читают stock только через `getStock(id)`

### Аналитика
- Отдельный таб **«Аналитика»** — журнал событий с статусом отправки (успех / ошибка / в процессе)
- По тапу на событие — модалка с полным JSON payload
- Типизированные события (`reportEvent<T>`), очередь отправки, мок с `SERVICE_UNAVAILABLE` (~20%)

| Событие | Когда |
|---|---|
| `CHECKOUT_STATE_CHANGED` | Изменение корзины или опций (MobX `reaction`, debounce 300 ms) |
| `CHECKOUT_TAPPED` | Нажатие «Оформить заказ» |
| `CHECKOUT_CONTINUED` | «Продолжить оформление» при активной брони |
| `CHECKOUT_FAILED` | Ошибка бронирования (stock, мин. сумма) |
| `RESERVATION_CANCELLED` | Отмена брони пользователем |
| `ORDER_SUBMITTED` | Отправка заказа на confirm |
| `ORDER_CONFIRMED` | Успешное оформление |
| `ORDER_FAILED` | Ошибка на финальном confirm |
| `ORDER_RESERVATION_EXPIRED` | Подтверждение без активной брони |

Снимок корзины для аналитики строится только из `cartLines` и опций — без зависимости от пагинации каталога.

### Инициализация
- `appInitStore` — гидрация сторов, загрузка мин. суммы заказа
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
| Паттерны | ts-pattern |
| Хранение | @react-native-async-storage/async-storage |
| Архитектура | Feature-Sliced Design (app / screens / widgets / features / entities / shared) |
| Качество | ESLint, Prettier, Husky, Jest (117 тестов) |

## Структура

```
src/
  app/           — App, навигация, global reactions
  screens/       — каталог, корзина, подтверждение, успех, ошибки, аналитика
  widgets/       — TabBarNavigation
  features/      — catalogProduct (карточка товара)
  entities/      — cart, order, product, analytics, app-init
  shared/        — api, ui, config, lib
```

## Запуск

```sh
npm install
npm start          # Metro
npm run ios        # или npm run android
npm run validate   # typecheck + lint
npm test           # unit-тесты
```
