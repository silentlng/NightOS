from __future__ import annotations

import json
import urllib.request
from typing import Any, Dict, Optional


class NotionClient:
    def __init__(self, token: Optional[str], database_id: Optional[str], notion_version: str) -> None:
        self.token = token
        self.database_id = database_id
        self.notion_version = notion_version

    def is_enabled(self) -> bool:
        return bool(self.token and self.database_id)

    def _request(self, method: str, path: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        if not self.is_enabled():
            raise RuntimeError("Notion integration is not configured.")
        data = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(
            f"https://api.notion.com/v1/{path}",
            data=data,
            method=method,
            headers={
                "Authorization": f"Bearer {self.token}",
                "Content-Type": "application/json",
                "Notion-Version": self.notion_version,
            },
        )
        with urllib.request.urlopen(req, timeout=30) as response:
            return json.loads(response.read().decode("utf-8"))

    def create_trade_page(self, trade: Dict[str, Any]) -> Optional[str]:
        if not self.is_enabled():
            return None
        signal = trade["signal"]
        payload = {
            "parent": {"database_id": self.database_id},
            "properties": {
                "Trade ID": {"title": [{"text": {"content": signal["trade_id"]}}]},
                "Date": {"date": {"start": trade["created_at"]}},
                "Asset": {"rich_text": [{"text": {"content": signal["asset"]}}]},
                "Direction": {"select": {"name": signal["direction"]}},
                "Timeframe": {"rich_text": [{"text": {"content": signal["timeframe"]}}]},
                "Status": {"select": {"name": trade["status"]}},
                "Validation": {"select": {"name": trade["validation_status"]}},
                "Execution": {"select": {"name": trade["execution_status"]}},
                "Risk %": {"number": signal["risk_percent"]},
                "Risk/Reward": {"number": signal["risk_reward"]},
                "Entry": {"number": signal["entry"]},
                "Stop Loss": {"number": signal["stop_loss"]},
                "Take Profit": {"number": signal["take_profit"]},
                "Confidence": {"rich_text": [{"text": {"content": signal["confidence_level"]}}]},
            },
        }
        result = self._request("POST", "pages", payload)
        return str(result["id"])

    def update_trade_page(self, page_id: str, trade: Dict[str, Any]) -> None:
        if not self.is_enabled():
            return
        payload = {
            "properties": {
                "Status": {"select": {"name": trade["status"]}},
                "Validation": {"select": {"name": trade["validation_status"]}},
                "Execution": {"select": {"name": trade["execution_status"]}},
            }
        }
        self._request("PATCH", f"pages/{page_id}", payload)

    def verify(self) -> Dict[str, Any]:
        if not self.is_enabled():
            raise RuntimeError("Notion integration is not configured.")
        return self._request("POST", f"databases/{self.database_id}/query", {})

    def create_database(self, parent_page_id: str, title: str = "Trading Journal") -> Dict[str, Any]:
        if not self.token:
            raise RuntimeError("Notion token is missing.")
        payload = {
            "parent": {"type": "page_id", "page_id": parent_page_id},
            "title": [{"type": "text", "text": {"content": title}}],
            "properties": {
                "Trade ID": {"title": {}},
                "Date": {"date": {}},
                "Asset": {"rich_text": {}},
                "Direction": {"select": {"options": [{"name": "LONG"}, {"name": "SHORT"}]}},
                "Timeframe": {"rich_text": {}},
                "Status": {
                    "select": {
                        "options": [
                            {"name": "TRADE_PENDING_VALIDATION"},
                            {"name": "VALIDATED"},
                            {"name": "REJECTED"},
                            {"name": "SL_TP_PLACED"},
                            {"name": "CLOSED"},
                            {"name": "NO_TRADE"},
                        ]
                    }
                },
                "Validation": {
                    "select": {"options": [{"name": "PENDING"}, {"name": "APPROVED"}, {"name": "REJECTED"}]}
                },
                "Execution": {
                    "select": {
                        "options": [
                            {"name": "NOT_EXECUTED"},
                            {"name": "EXECUTION_PENDING"},
                            {"name": "EXECUTED"},
                        ]
                    }
                },
                "Risk %": {"number": {"format": "percent"}},
                "Risk/Reward": {"number": {"format": "number"}},
                "Entry": {"number": {"format": "number_with_commas"}},
                "Stop Loss": {"number": {"format": "number_with_commas"}},
                "Take Profit": {"number": {"format": "number_with_commas"}},
                "Confidence": {"rich_text": {}},
            },
        }
        return self._request("POST", "databases", payload)
