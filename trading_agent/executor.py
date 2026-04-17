from __future__ import annotations

import hashlib
import hmac
import json
import math
import time
import urllib.parse
import urllib.request
from abc import ABC, abstractmethod
from typing import Any, Dict, Optional, Tuple

from .config import Settings


class BaseExecutor(ABC):
    @abstractmethod
    def execute(self, trade: Dict[str, Any]) -> Dict[str, Any]:
        raise NotImplementedError


class PaperExecutor(BaseExecutor):
    def execute(self, trade: Dict[str, Any]) -> Dict[str, Any]:
        signal = trade["signal"]
        executed_at = int(time.time() * 1000)
        return {
            "mode": "paper",
            "symbol": signal["asset"],
            "side": "BUY" if signal["direction"] == "LONG" else "SELL",
            "entry_price": signal["entry"],
            "stop_loss": signal["stop_loss"],
            "take_profit": signal["take_profit"],
            "quantity": signal["position_size"],
            "entry_order_id": f"paper-entry-{executed_at}",
            "stop_order_id": f"paper-stop-{executed_at}",
            "take_profit_order_id": f"paper-tp-{executed_at}",
            "executed_at": executed_at,
        }


class BinanceFuturesTestnetExecutor(BaseExecutor):
    def __init__(self, settings: Settings) -> None:
        self.settings = settings
        if not settings.binance_api_key or not settings.binance_api_secret:
            raise RuntimeError("Binance credentials are missing.")

    def _sign(self, query: str) -> str:
        return hmac.new(
            self.settings.binance_api_secret.encode("utf-8"),
            query.encode("utf-8"),
            hashlib.sha256,
        ).hexdigest()

    def _request(
        self, method: str, path: str, payload: Dict[str, Any], signed: bool = True
    ) -> Dict[str, Any]:
        params = dict(payload)
        if signed:
            params["timestamp"] = int(time.time() * 1000)
            params["recvWindow"] = 5000
        query = urllib.parse.urlencode(params, doseq=True)
        if signed:
            query = f"{query}&signature={self._sign(query)}"
        data = query.encode("utf-8")
        request = urllib.request.Request(
            f"{self.settings.binance_futures_testnet_url}{path}",
            data=data,
            method=method,
            headers={"X-MBX-APIKEY": self.settings.binance_api_key},
        )
        with urllib.request.urlopen(request, timeout=30) as response:
            return json.loads(response.read().decode("utf-8"))

    def _get_symbol_filters(self, symbol: str) -> Tuple[float, int, int]:
        request = urllib.request.Request(
            f"{self.settings.binance_futures_testnet_url}/fapi/v1/exchangeInfo",
            method="GET",
        )
        with urllib.request.urlopen(request, timeout=30) as response:
            exchange_info = json.loads(response.read().decode("utf-8"))

        for item in exchange_info["symbols"]:
            if item["symbol"] != symbol:
                continue
            lot_size = next(f for f in item["filters"] if f["filterType"] == "LOT_SIZE")
            return (
                float(lot_size["stepSize"]),
                int(item["quantityPrecision"]),
                int(item["pricePrecision"]),
            )
        raise RuntimeError(f"Unknown Binance symbol: {symbol}")

    @staticmethod
    def _round_step(value: float, step: float, precision: int) -> float:
        if step <= 0:
            return round(value, precision)
        rounded = math.floor(value / step) * step
        return round(rounded, precision)

    def execute(self, trade: Dict[str, Any]) -> Dict[str, Any]:
        signal = trade["signal"]
        symbol = signal["asset"]
        qty_step, qty_precision, price_precision = self._get_symbol_filters(symbol)
        quantity = self._round_step(float(signal["position_size"]), qty_step, qty_precision)
        if quantity <= 0:
            raise RuntimeError("Rounded Binance quantity is zero. Increase capital or adjust stop distance.")

        direction = signal["direction"]
        entry_side = "BUY" if direction == "LONG" else "SELL"
        exit_side = "SELL" if direction == "LONG" else "BUY"
        stop_price = round(float(signal["stop_loss"]), price_precision)
        take_profit = round(float(signal["take_profit"]), price_precision)

        entry_order = self._request(
            "POST",
            "/fapi/v1/order",
            {
                "symbol": symbol,
                "side": entry_side,
                "type": "MARKET",
                "quantity": quantity,
            },
        )
        stop_order = self._request(
            "POST",
            "/fapi/v1/order",
            {
                "symbol": symbol,
                "side": exit_side,
                "type": "STOP_MARKET",
                "stopPrice": stop_price,
                "quantity": quantity,
                "reduceOnly": "true",
                "workingType": "MARK_PRICE",
            },
        )
        take_profit_order = self._request(
            "POST",
            "/fapi/v1/order",
            {
                "symbol": symbol,
                "side": exit_side,
                "type": "TAKE_PROFIT_MARKET",
                "stopPrice": take_profit,
                "quantity": quantity,
                "reduceOnly": "true",
                "workingType": "MARK_PRICE",
            },
        )
        return {
            "mode": "binance_futures_testnet",
            "symbol": symbol,
            "side": entry_side,
            "quantity": quantity,
            "entry_order": entry_order,
            "stop_order": stop_order,
            "take_profit_order": take_profit_order,
        }

    def verify(self) -> Dict[str, Any]:
        balance = self._request("GET", "/fapi/v2/balance", {}, signed=True)
        return {
            "mode": "binance_futures_testnet",
            "balances_count": len(balance) if isinstance(balance, list) else 0,
            "sample": balance[:3] if isinstance(balance, list) else balance,
        }


def build_executor(settings: Settings) -> BaseExecutor:
    if settings.binance_mode == "binance_futures_testnet":
        return BinanceFuturesTestnetExecutor(settings)
    return PaperExecutor()
