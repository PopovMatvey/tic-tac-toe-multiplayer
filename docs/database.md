# База

PostgreSQL 16. Схема Prisma: `server/prisma/schema.prisma`. Миграции: `server/prisma/migrations`.

Подключение с машины: `postgresql://ttt:ttt@localhost:5433/ttt`. Порт 5433, чтобы не пересечься с локальным Postgres на 5432. Пароль только для локального compose.

## Таблицы

`User` — игрок. `name` как ввёл человек, `nameKey` в нижнем регистре и уникален. `wins` — число выигранных матчей, не партий.

`Match` — матч до трёх побед. `status`: `waiting`, `active`, `finished`. `playerXId` создаёт матч и ходит первым. `playerOId` пустой, пока соперник не найден. `boardSize` — `N` на момент создания. `winsX` и `winsO` — победы в партиях. `winnerId` заполняется в конце матча. `lastOutcome` — итог последней партии (`x_win`, `o_win`, `draw`), чтобы клиент показал плашку на новом пустом поле. Сбрасывается первым ходом следующей партии.

`Game` — одна партия внутри матча. `board` — JSON-массив длины `N*N`. `status`: `active`, `x_win`, `o_win`, `draw`. `nextMark` — чей ход. Пара `(matchId, index)` уникальна, первая партия имеет `index` 1.

`Move` — принятый ход. Пара `(gameId, index)` уникальна: повтор того же номера хода не записывается.

Очередь и ход сериализуются транзакцией. Ожидающий матч берётся так:

```sql
SELECT id FROM "Match"
WHERE status = 'waiting' AND "playerXId" <> $player
ORDER BY "createdAt" ASC
FOR UPDATE SKIP LOCKED
LIMIT 1
```

Перед этим транзакция берёт `pg_advisory_xact_lock`, чтобы два инстанса не создали две отдельные очереди одновременно.

## Миграции

На старте контейнера: `npx prisma migrate deploy`.

Локально из `server/` после поднятого Postgres:

```powershell
npx prisma migrate deploy
```

Новая миграция в разработке:

```powershell
npx prisma migrate dev --name описание
```
