# Документация

- [Запуск](README.md) — этот файл
- [Сервер](server.md)
- [Клиент](client.md)
- [База](database.md)
- [Kafka](kafka.md)
- [Nginx](nginx.md)
- [Правила игры](game.md)

Задание лежит в `task/Task Node.js Dev.pdf`.

## Весь стек в Docker

Нужны Docker и свободные порты `2101`, `5433`, `9092`.

Из корня репозитория:

```powershell
docker compose up --build
```

Открыть http://localhost:2101 в двух разных браузерах (или обычном и приватном). В каждом зарегистрировать своё имя латиницей и нажать «Искать игру».

Размер поля задаётся при запуске, оба инстанса получают одно значение:

```powershell
$env:DESK_SIZE = "4"
docker compose up --build
```

Без переменной поле 3×3.

Проверка, что HTTP попадает на разные процессы:

```powershell
curl http://localhost:2101/api/health
curl http://localhost:2101/api/health
```

В ответе чередуются `app1` и `app2`. Сокет после открытия страницы остаётся на том инстансе, куда nginx отдал WebSocket. Ход всё равно доходит до второго игрока: его доставляет Kafka, а не прямой запрос между процессами.

Остановка:

```powershell
docker compose down
```

Данные Postgres сохраняются в томе `pgdata`. Чтобы стереть их: `docker compose down -v`.

## Локально: один Nest и Vite

Postgres и Kafka в Docker, сервер и клиент на машине. Так удобнее править интерфейс.

```powershell
docker compose up -d postgres kafka
```

Сервер:

```powershell
cd server
Copy-Item .env.example .env
npm install
npx prisma generate
npx prisma migrate deploy
npm run start:dev
```

Клиент, второй терминал:

```powershell
cd client
Copy-Item .env.example .env
npm install
npm start
```

Клиент: http://localhost:2101. API и сокет: `http://localhost:3000` из `client/.env`.

Второй инстанс на этой же машине, если нужно увидеть шину без nginx:

```powershell
$env:PORT = "3001"
$env:INSTANCE_ID = "local-2"
$env:DATABASE_URL = "postgresql://ttt:ttt@localhost:5433/ttt"
$env:KAFKA_BROKERS = "localhost:9092"
npm run start:dev
```

`INSTANCE_ID` у процессов должен отличаться. Иначе они делят одну consumer group и часть событий пропадёт. Подробности в [kafka.md](kafka.md).

## Linux и PM2

Те же два процесса, что в PowerShell выше. Команды зафиксированы в `deploy/commands.sh`. Фон через PM2 — `deploy/start.sh`. Нужен глобальный `pm2` (`npm install -g pm2`). Postgres и Kafka уже должны быть запущены.

```bash
cd server
cp -f .env.example .env
npm run start:dev
```

```bash
cd client
cp -f .env.example .env
npm start
```

Оба сразу:

```bash
bash deploy/start.sh
bash deploy/stop.sh
```

Логи: `pm2 logs`. Клиент: http://localhost:2101.
