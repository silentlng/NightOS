from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path
from typing import Optional


def _load_dotenv(dotenv_path: Path) -> None:
    if not dotenv_path.exists():
        return

    for raw_line in dotenv_path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        os.environ.setdefault(key, value)


def _as_float(name: str, default: float) -> float:
    value = os.getenv(name)
    if value is None or value == "":
        return default
    return float(value)


def _as_int(name: str, default: int) -> int:
    value = os.getenv(name)
    if value is None or value == "":
        return default
    return int(value)


@dataclass
class Settings:
    base_dir: Path
    data_dir: Path
    state_file: Path
    journal_file: Path
    host: str
    port: int
    app_base_url: Optional[str]
    telegram_bot_token: Optional[str]
    telegram_chat_id: Optional[str]
    telegram_webhook_secret: Optional[str]
    telegram_timeout: int
    notion_token: Optional[str]
    notion_database_id: Optional[str]
    notion_version: str
    binance_mode: str
    binance_api_key: Optional[str]
    binance_api_secret: Optional[str]
    binance_futures_testnet_url: str
    total_capital_eur: float
    max_risk_percent: float
    min_rr: float
    daily_trade_limit: int


def load_settings(base_dir: Optional[Path] = None) -> Settings:
    root = (base_dir or Path.cwd()).resolve()
    _load_dotenv(root / ".env")

    data_dir = root / "data" / "trading-agent"
    data_dir.mkdir(parents=True, exist_ok=True)

    return Settings(
        base_dir=root,
        data_dir=data_dir,
        state_file=data_dir / "state.json",
        journal_file=data_dir / "journal.jsonl",
        host=os.getenv("TRADING_AGENT_HOST", "127.0.0.1"),
        port=_as_int("TRADING_AGENT_PORT", 8787),
        app_base_url=os.getenv("APP_BASE_URL"),
        telegram_bot_token=os.getenv("TELEGRAM_BOT_TOKEN"),
        telegram_chat_id=os.getenv("TELEGRAM_CHAT_ID"),
        telegram_webhook_secret=os.getenv("TELEGRAM_WEBHOOK_SECRET"),
        telegram_timeout=_as_int("TELEGRAM_TIMEOUT", 30),
        notion_token=os.getenv("NOTION_TOKEN"),
        notion_database_id=os.getenv("NOTION_DATABASE_ID"),
        notion_version=os.getenv("NOTION_VERSION", "2022-06-28"),
        binance_mode=os.getenv("BINANCE_MODE", "paper"),
        binance_api_key=os.getenv("BINANCE_API_KEY"),
        binance_api_secret=os.getenv("BINANCE_API_SECRET"),
        binance_futures_testnet_url=os.getenv(
            "BINANCE_FUTURES_TESTNET_URL", "https://demo-fapi.binance.com"
        ),
        total_capital_eur=_as_float("TOTAL_CAPITAL_EUR", 1000.0),
        max_risk_percent=_as_float("MAX_RISK_PERCENT", 1.0),
        min_rr=_as_float("MIN_RR", 2.0),
        daily_trade_limit=_as_int("DAILY_TRADE_LIMIT", 1),
    )
