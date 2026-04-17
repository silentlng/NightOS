#!/usr/bin/env bash
set -euo pipefail

: "${TELEGRAM_BOT_TOKEN:?Set TELEGRAM_BOT_TOKEN first}"

raw_json="$(curl -fsS --get "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getUpdates" \
  --data-urlencode "timeout=${TELEGRAM_TIMEOUT:-10}")"

python3 - <<'PY' "${raw_json}"
import json
import sys

payload = json.loads(sys.argv[1])
seen = set()

for item in payload.get("result", []):
    message = item.get("message") or item.get("callback_query", {}).get("message") or {}
    chat = message.get("chat") or {}
    chat_id = chat.get("id")
    if chat_id is None or chat_id in seen:
        continue
    seen.add(chat_id)
    chat_type = chat.get("type", "unknown")
    label = chat.get("title") or chat.get("username") or "private chat"
    print(f"chat_id={chat_id} | type={chat_type} | label={label}")

if not seen:
    print("No chats found. Open the bot in Telegram and send /start first.")
PY
