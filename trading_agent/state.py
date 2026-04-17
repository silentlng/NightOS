from __future__ import annotations

import json
from pathlib import Path
from threading import Lock
from typing import Any, Dict, List, Optional

from .models import utc_now_iso


class StateStore:
    def __init__(self, state_file: Path, journal_file: Path) -> None:
        self.state_file = state_file
        self.journal_file = journal_file
        self.lock = Lock()
        self.state_file.parent.mkdir(parents=True, exist_ok=True)
        if not self.state_file.exists():
            self.state_file.write_text(json.dumps({"trades": {}, "events": []}, indent=2), encoding="utf-8")

    def _read(self) -> Dict[str, Any]:
        return json.loads(self.state_file.read_text(encoding="utf-8"))

    def _write(self, payload: Dict[str, Any]) -> None:
        self.state_file.write_text(json.dumps(payload, indent=2, ensure_ascii=True), encoding="utf-8")

    def save_trade(self, trade_id: str, trade_payload: Dict[str, Any]) -> None:
        with self.lock:
            data = self._read()
            data.setdefault("trades", {})[trade_id] = trade_payload
            self._write(data)

    def get_trade(self, trade_id: str) -> Optional[Dict[str, Any]]:
        with self.lock:
            return self._read().get("trades", {}).get(trade_id)

    def update_trade(self, trade_id: str, updates: Dict[str, Any]) -> Dict[str, Any]:
        with self.lock:
            data = self._read()
            trades = data.setdefault("trades", {})
            if trade_id not in trades:
                raise KeyError(f"Unknown trade_id: {trade_id}")
            trade = trades[trade_id]
            trade.update(updates)
            trade["updated_at"] = utc_now_iso()
            trades[trade_id] = trade
            self._write(data)
            return trade

    def list_trades(self) -> List[Dict[str, Any]]:
        with self.lock:
            trades = self._read().get("trades", {})
            return [trades[key] for key in sorted(trades)]

    def count_trades_for_date(self, iso_date: str) -> int:
        with self.lock:
            count = 0
            trades = self._read().get("trades", {})
            for trade in trades.values():
                created_at = str(trade.get("created_at", ""))
                if created_at.startswith(iso_date) and trade.get("status") != "NO_TRADE":
                    count += 1
            return count

    def append_event(self, event_type: str, payload: Dict[str, Any]) -> None:
        event = {
            "timestamp": utc_now_iso(),
            "event_type": event_type,
            "payload": payload,
        }
        with self.lock:
            current = self._read()
            current.setdefault("events", []).append(event)
            self._write(current)
            with self.journal_file.open("a", encoding="utf-8") as handle:
                handle.write(json.dumps(event, ensure_ascii=True) + "\n")

