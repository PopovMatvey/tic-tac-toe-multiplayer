#!/usr/bin/env bash
# Зафиксированные команды запуска сервера и клиента.
# Аналог PowerShell:
#   cd server
#   Copy-Item .env.example .env
#   npm run start:dev
#   cd client
#   Copy-Item .env.example .env
#   npm start
#
# На Linux те же шаги в двух терминалах. Долгий процесс держит терминал,
# поэтому для фона используется PM2: ./start.sh

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

cd "$ROOT/server"
cp -f .env.example .env
npm run start:dev &
SERVER_PID=$!

cd "$ROOT/client"
cp -f .env.example .env
npm start &
CLIENT_PID=$!

echo "server pid ${SERVER_PID}, client pid ${CLIENT_PID}"
wait
