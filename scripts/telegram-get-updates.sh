#!/usr/bin/env bash
set -euo pipefail

: "${TELEGRAM_BOT_TOKEN:?Set TELEGRAM_BOT_TOKEN first}"

offset="${1:-}"
timeout="${TELEGRAM_TIMEOUT:-30}"
url="https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getUpdates"

if [[ -n "${offset}" ]]; then
  curl -fsS --get "${url}" \
    --data-urlencode "timeout=${timeout}" \
    --data-urlencode "offset=${offset}"
else
  curl -fsS --get "${url}" \
    --data-urlencode "timeout=${timeout}"
fi
