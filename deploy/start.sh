#!/usr/bin/env bash
# PM2: те же сущности, что и команды в commands.sh.
#   server: cp .env.example .env && npm run start:dev
#   client: cp .env.example .env && npm start

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

if ! command -v pm2 >/dev/null 2>&1; then
  echo "Нужен pm2: npm install -g pm2" >&2
  exit 1
fi

cp -f "$ROOT/server/.env.example" "$ROOT/server/.env"
cp -f "$ROOT/client/.env.example" "$ROOT/client/.env"

pm2 startOrReload "$ROOT/deploy/ecosystem.config.cjs" --update-env
pm2 status
