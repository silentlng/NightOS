from __future__ import annotations

import argparse
import json

from .config import load_settings
from .telegram_client import TelegramClient
from .workflow import TradingWorkflow


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Semi-automated trading agent")
    sub = parser.add_subparsers(dest="command", required=True)

    sub.add_parser("serve", help="Run the local webhook server")
    sub.add_parser("list-trades", help="List saved trades")
    sub.add_parser("no-trade", help="Log a no-trade day")
    sub.add_parser("demo-signal", help="Create a demo signal and send it to Telegram")

    approve = sub.add_parser("approve", help="Approve and execute a pending trade locally")
    approve.add_argument("trade_id")

    reject = sub.add_parser("reject", help="Reject a pending trade locally")
    reject.add_argument("trade_id")

    webhook = sub.add_parser("set-webhook", help="Set Telegram webhook")
    webhook.add_argument("url", help="Public webhook URL")

    sub.add_parser("check-notion", help="Verify Notion credentials and database access")
    notion_db = sub.add_parser("bootstrap-notion-db", help="Create a Notion trades database under a parent page")
    notion_db.add_argument("parent_page_id")
    notion_db.add_argument("--title", default="Trading Journal")

    sub.add_parser("check-binance", help="Verify Binance Futures testnet credentials")

    callback = sub.add_parser("simulate-callback", help="Replay a callback locally")
    callback.add_argument("action", choices=["VALIDATE", "REJECT"])
    callback.add_argument("trade_id")
    return parser


def demo_payload(settings) -> dict:
    return {
        "trade_id": "BTC-DEMO-001",
        "asset": "BTCUSDT",
        "timeframe": "H4",
        "market_condition": "Trending market with pullback into support",
        "trend": "Bullish on H4 and D1",
        "volatility": "Moderate",
        "clarity_level": "High",
        "sources_reviewed": ["Rekt Capital", "CrediBULL Crypto", "Michael van de Poppe"],
        "assets_mentioned": ["BTC", "ETH"],
        "social_bias": "Bullish",
        "credibility_assessment": "Specific levels shared by multiple whitelist sources",
        "alignment_with_market_structure": "Aligned",
        "setup_type": "Pullback continuation",
        "direction": "LONG",
        "entry": 62500,
        "stop_loss": 61800,
        "take_profit": 64200,
        "risk_reward": 2.4,
        "position_size": None,
        "confluences": ["H4 support", "EMA alignment", "RSI recovery"],
        "technical_reasons": [
            "Price reclaimed local support",
            "Trend remains bullish on H4 and D1",
            "Invalidation is clean below support",
        ],
        "social_information_support": [
            "Whitelist sources remain constructive on BTC",
            "Recent commentary includes concrete reclaim levels",
        ],
        "strength_factors": [
            "High timeframe alignment",
            "Clean invalidation",
            "RR above minimum threshold",
        ],
        "weakness_factors": ["Trade depends on support holding on H4 close"],
        "risk_elements": ["News volatility can expand spreads"],
        "trade_invalid_if": "H4 candle closes below 61800 support zone",
        "action_to_take_if_invalid": "Cancel the setup or exit immediately if already executed",
        "confidence_level": "7.5/10 evidence-based confidence",
        "risk_percent": settings.max_risk_percent,
        "total_capital_eur": settings.total_capital_eur,
    }


def main() -> None:
    parser = build_parser()
    args = parser.parse_args()
    settings = load_settings()
    workflow = TradingWorkflow(settings)

    if args.command == "serve":
        from .server import run_server

        run_server()
        return

    if args.command == "list-trades":
        print(json.dumps(workflow.store.list_trades(), indent=2, ensure_ascii=True))
        return

    if args.command == "no-trade":
        print(json.dumps(workflow.record_no_trade(), indent=2, ensure_ascii=True))
        return

    if args.command == "demo-signal":
        print(json.dumps(workflow.create_trade(demo_payload(settings)), indent=2, ensure_ascii=True))
        return

    if args.command == "approve":
        print(json.dumps(workflow.validate_and_execute_trade(args.trade_id), indent=2, ensure_ascii=True))
        return

    if args.command == "reject":
        print(json.dumps(workflow.reject_trade(args.trade_id), indent=2, ensure_ascii=True))
        return

    if args.command == "set-webhook":
        client = TelegramClient(settings.telegram_bot_token, settings.telegram_timeout)
        secret = settings.telegram_webhook_secret
        print(json.dumps(client.set_webhook(args.url, secret), indent=2, ensure_ascii=True))
        return

    if args.command == "check-notion":
        print(json.dumps(workflow.notion.verify(), indent=2, ensure_ascii=True))
        return

    if args.command == "bootstrap-notion-db":
        result = workflow.notion.create_database(args.parent_page_id, title=args.title)
        print(json.dumps(result, indent=2, ensure_ascii=True))
        return

    if args.command == "check-binance":
        if not hasattr(workflow.executor, "verify"):
            raise SystemExit("Active executor does not expose a verify method. Set BINANCE_MODE=binance_futures_testnet.")
        print(json.dumps(workflow.executor.verify(), indent=2, ensure_ascii=True))
        return

    if args.command == "simulate-callback":
        payload = {
            "callback_query": {
                "id": "local-callback",
                "data": f"{args.action}:{args.trade_id}",
            }
        }
        print(
            json.dumps(
                workflow.handle_update(payload, secret_token=settings.telegram_webhook_secret),
                indent=2,
                ensure_ascii=True,
            )
        )
        return


if __name__ == "__main__":
    main()
