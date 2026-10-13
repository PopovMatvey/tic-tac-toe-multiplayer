# Клиент

Каталог `client/`. React и Vite.

Экраны:

- `/` — регистрация. `userId` пишется в `localStorage`.
- `/lobby` — поиск игры и ожидание соперника.
- `/game` — поле, серия из трёх отметок, ход, плашка ничьей или победы в партии, по концу матча кнопка новой игры.
- `/leaders` — таблица.

Клиент не решает, кто победил и чей ход. Он рисует `match.state`.

## Запросы

`src/api/http.ts` ходит в `REACT_APP_API_URL`. Пустая строка значит тот же хост: так собранный клиент работает за nginx.

Сокет в `src/session/GameSession.tsx`:

- адрес тот же, что API; в проде `undefined`, то есть страница сама
- `transports: ['websocket']`
- `auth: { userId }`

События: `queue.join`, `game.move`, входящие `match.state` и `game.error`.

## Запуск для вёрстки

Postgres, Kafka и сервер уже подняты, см. [README.md](README.md).

```powershell
cd client
Copy-Item .env.example .env
npm install
npm start
```

Сборка статики: `npm run build`. Результат в `client/dist`. Образ nginx собирает её сам.
