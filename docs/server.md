# Сервер

Каталог `server/`. NestJS, TypeScript.

Слои:

- `users` — регистрация и чтение игрока. HTTP.
- `leaders` — таблица побед. HTTP, тот же `UsersService`.
- `matches` — очередь, ходы, серия партий. `MatchesGateway` только принимает сокет и отдаёт снимок. Правила поля в `game-rules.ts`, серия до 3 побед в `series.ts`, запись в БД в `MatchesService`.
- `messaging` — интерфейс `GameEventBus` и реализация на Kafka.
- `prisma` — клиент базы.

## HTTP

| Метод | Путь | Зачем |
|---|---|---|
| POST | `/api/users` | Тело `{ "name": "Anna" }`. Имя латиницей, 2–20 символов, уникальное без учёта регистра |
| GET | `/api/users/:id` | Игрок для восстановления сессии |
| GET | `/api/leaders` | Игроки по `wins` по убыванию, при равенстве по имени |
| GET | `/api/health` | `{ ok, instanceId }` — какой процесс ответил |

Повтор имени — `409`. Нелатиница — `400`.

## Socket.IO

Только транспорт `websocket`, чтобы опрос Socket.IO не прыгал между инстансами за nginx.

Подключение: `auth.userId` — id из регистрации.

- клиент шлёт `queue.join` — встать в очередь или вернуться в текущий матч
- клиент шлёт `game.move` с `{ cell }` — индекс клетки с нуля, слева направо, сверху вниз
- сервер шлёт `match.state` — снимок из [game.md](game.md), поле `you` добавлено уже на этом инстансе
- сервер шлёт `game.error` с `{ message }`

После подключения инстанс читает из Postgres текущий матч игрока (ожидание, активный или последний завершённый) и сразу отдаёт его в этот сокет.

## Переменные

Смотри `server/.env.example`.

- `DATABASE_URL`
- `KAFKA_BROKERS` — для процесса на машине `localhost:9092`, внутри compose `kafka:29092`
- `KAFKA_TOPIC` — по умолчанию `game.events`
- `INSTANCE_ID` — уникален на процесс
- `DESK_SIZE` — целое 3…10, по умолчанию 3. Берётся в момент создания матча и пишется в строку матча
- `PORT` — по умолчанию 3000

## Один инстанс

```powershell
cd server
npm install
npx prisma generate
npx prisma migrate deploy
npm run start:dev
```

Тесты правил, без базы и Kafka:

```powershell
npm test
```

Сборка: `npm run build`, запуск собранного: `npm start`.
