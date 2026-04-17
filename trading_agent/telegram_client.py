from __future__ import annotations

import json
import urllib.parse
import urllib.request
from typing import Any, Dict, Optional


class TelegramClient:
    def __init__(self, bot_token: Optional[str], timeout: int = 30) -> None:
        self.bot_token = bot_token
        self.timeout = timeout

    def is_enabled(self) -> bool:
        return bool(self.bot_token)

    def _request(self, method: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        if not self.bot_token:
            raise RuntimeError("Telegram bot token is missing.")
        url = f"https://api.telegram.org/bot{self.bot_token}/{method}"
        encoded = urllib.parse.urlencode(payload).encode("utf-8")
        request = urllib.request.Request(url, data=encoded, method="POST")
        with urllib.request.urlopen(request, timeout=self.timeout) as response:
            return json.loads(response.read().decode("utf-8"))

    def send_message(
        self,
        chat_id: str,
        text: str,
        reply_markup: Optional[Dict[str, Any]] = None,
        parse_mode: str = "HTML",
    ) -> Dict[str, Any]:
        payload: Dict[str, Any] = {
            "chat_id": chat_id,
            "text": text,
            "parse_mode": parse_mode,
        }
        if reply_markup:
            payload["reply_markup"] = json.dumps(reply_markup)
        return self._request("sendMessage", payload)

    def answer_callback_query(self, callback_query_id: str, text: str) -> Dict[str, Any]:
        return self._request(
            "answerCallbackQuery",
            {
                "callback_query_id": callback_query_id,
                "text": text,
                "show_alert": "false",
            },
        )

    def set_webhook(self, url: str, secret_token: Optional[str] = None) -> Dict[str, Any]:
        payload: Dict[str, Any] = {"url": url}
        if secret_token:
            payload["secret_token"] = secret_token
        return self._request("setWebhook", payload)

