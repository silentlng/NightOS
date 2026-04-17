#!/usr/bin/env bash
set -euo pipefail

: "${TELEGRAM_BOT_TOKEN:?Set TELEGRAM_BOT_TOKEN first}"

chat_id="${1:-${TELEGRAM_CHAT_ID:-}}"
message="${2:-Test Telegram OK}"

if [[ -z "${chat_id}" ]]; then
  echo "Usage: TELEGRAM_CHAT_ID=123 ./scripts/telegram-send-test.sh [chat_id] [message]" >&2
  exit 1
fi

curl -fsS -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" \
  --data-urlencode "chat_id=${chat_id}" \
  --data-urlencode "text=${message}"
