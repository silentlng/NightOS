#!/usr/bin/env bash
set -euo pipefail

: "${TELEGRAM_BOT_TOKEN:?Set TELEGRAM_BOT_TOKEN first}"

chat_id="${1:-${TELEGRAM_CHAT_ID:-}}"
trade_id="${2:-BTC-$(date +%F)-01}"

if [[ -z "${chat_id}" ]]; then
  echo "Usage: TELEGRAM_CHAT_ID=123 ./scripts/telegram-send-trade-demo.sh [chat_id] [trade_id]" >&2
  exit 1
fi

message=$'<b>TRADE DETECTED</b>\n\n'
message+="Trade ID: ${trade_id}"$'\n'
message+=$'Asset: BTCUSDT\n'
message+=$'Timeframe: H4\n'
message+=$'Direction: LONG\n'
message+=$'Entry: 62500\n'
message+=$'Stop Loss: 61800\n'
message+=$'Take Profit: 64200\n'
message+=$'Risk/Reward: 1:2.4\n'
message+=$'Position Size: 0.014 BTC\n'
message+=$'Confidence: 7.5/10\n\n'
message+=$'<b>Technical reasons</b>\n'
message+=$'- Support H4\n'
message+=$'- EMA trend alignment\n'
message+=$'- RSI recovery\n\n'
message+=$'<b>Social summary</b>\n'
message+=$'- 3 whitelist sources mention bullish bias\n'
message+=$'- 2 sources gave concrete levels\n'
message+=$'- No major conflict\n\n'
message+=$'<b>Status</b>\n'
message+=$'Human validation required before execution'

reply_markup=$(cat <<JSON
{"inline_keyboard":[[{"text":"VALIDATE","callback_data":"VALIDATE:${trade_id}"},{"text":"REJECT","callback_data":"REJECT:${trade_id}"}]]}
JSON
)

curl -fsS -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" \
  --data-urlencode "chat_id=${chat_id}" \
  --data-urlencode "parse_mode=HTML" \
  --data-urlencode "text=${message}" \
  --data-urlencode "reply_markup=${reply_markup}"
