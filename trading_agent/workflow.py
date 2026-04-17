from __future__ import annotations

import html
from datetime import datetime, timezone
from typing import Any, Dict, Optional, Tuple

from .config import Settings
from .executor import build_executor
from .models import TradeSignal, make_trade_record
from .notion_client import NotionClient
from .state import StateStore
from .telegram_client import TelegramClient


class TradingWorkflow:
    def __init__(self, settings: Settings) -> None:
        self.settings = settings
        self.store = StateStore(settings.state_file, settings.journal_file)
        self.telegram = TelegramClient(settings.telegram_bot_token, settings.telegram_timeout)
        self.notion = NotionClient(
            settings.notion_token, settings.notion_database_id, settings.notion_version
        )
        self.executor = build_executor(settings)

    def _today_utc(self) -> str:
        return datetime.now(timezone.utc).date().isoformat()

    def _format_signal_message(self, signal: Dict[str, Any]) -> str:
        text = [
            "<b>[MARKET CONTEXT]</b>",
            f"- Asset: {html.escape(signal['asset'])}",
            f"- Timeframe: {html.escape(signal['timeframe'])}",
            f"- Market condition: {html.escape(signal['market_condition'])}",
            f"- Trend: {html.escape(signal['trend'])}",
            f"- Volatility: {html.escape(signal['volatility'])}",
            f"- Clarity level: {html.escape(signal['clarity_level'])}",
            "",
            "<b>[SOCIAL / INFORMATION CONTEXT]</b>",
            f"- Sources reviewed: {html.escape(', '.join(signal['sources_reviewed']) or 'none')}",
            f"- Assets mentioned: {html.escape(', '.join(signal['assets_mentioned']) or 'none')}",
            f"- Social bias: {html.escape(signal['social_bias'])}",
            f"- Credibility assessment: {html.escape(signal['credibility_assessment'])}",
            f"- Alignment with market structure: {html.escape(signal['alignment_with_market_structure'])}",
            "",
            "<b>[SELECTED TRADE]</b>",
            f"- Setup type: {html.escape(signal['setup_type'])}",
            f"- Direction: {html.escape(signal['direction'])}",
            f"- Entry: {signal['entry']}",
            f"- Stop loss: {signal['stop_loss']}",
            f"- Take profit: {signal['take_profit']}",
            f"- Risk/Reward: {signal['risk_reward']}",
            f"- Position size: {signal['position_size']}",
            f"- Confluences: {html.escape(', '.join(signal['confluences']))}",
            "",
            "<b>[JUSTIFICATION]</b>",
            f"- Technical reasons: {html.escape(' | '.join(signal['technical_reasons']))}",
            f"- Social/information support: {html.escape(' | '.join(signal['social_information_support']))}",
            f"- Strength factors: {html.escape(' | '.join(signal['strength_factors']))}",
            f"- Weakness factors: {html.escape(' | '.join(signal['weakness_factors']))}",
            f"- Risk elements: {html.escape(' | '.join(signal['risk_elements']))}",
            "",
            "<b>[HUMAN VALIDATION]</b>",
            f"- Why manual validation is required: {html.escape(signal['why_manual_validation_required'])}",
            f"- Control question before execution: {html.escape(signal['control_question_before_execution'])}",
            "- Status: Human validation required before execution",
            "",
            "<b>[INVALIDATION]</b>",
            f"- Trade invalid if: {html.escape(signal['trade_invalid_if'])}",
            f"- Action to take: {html.escape(signal['action_to_take_if_invalid'])}",
            "",
            "<b>[EXECUTION RULE]</b>",
            "- Execute only after explicit human approval: VALIDATE",
            "- If approved, automate order placement and journaling",
            "- If not approved, do not execute",
        ]
        return "\n".join(text)

    def _notify_trade(self, trade: Dict[str, Any]) -> Optional[int]:
        if not (self.telegram.is_enabled() and self.settings.telegram_chat_id):
            return None

        signal = trade["signal"]
        keyboard = {
            "inline_keyboard": [
                [
                    {"text": "VALIDATE", "callback_data": f"VALIDATE:{signal['trade_id']}"},
                    {"text": "REJECT", "callback_data": f"REJECT:{signal['trade_id']}"},
                ]
            ]
        }
        response = self.telegram.send_message(
            chat_id=self.settings.telegram_chat_id,
            text=self._format_signal_message(signal),
            reply_markup=keyboard,
        )
        result = response.get("result", {})
        return result.get("message_id")

    def _notify_no_trade(self) -> None:
        if not (self.telegram.is_enabled() and self.settings.telegram_chat_id):
            return
        self.telegram.send_message(
            chat_id=self.settings.telegram_chat_id,
            text="No rational trade today",
            reply_markup=None,
        )

    def create_trade(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        if self.store.count_trades_for_date(self._today_utc()) >= self.settings.daily_trade_limit:
            raise ValueError("Daily trade limit reached.")

        signal = TradeSignal.from_payload(
            payload,
            default_capital=self.settings.total_capital_eur,
            default_risk_percent=self.settings.max_risk_percent,
        )
        signal.validate(self.settings.min_rr, self.settings.max_risk_percent)
        record = make_trade_record(signal)
        self.store.save_trade(signal.trade_id, record.to_dict())
        self.store.append_event("trade_detected", {"trade_id": signal.trade_id, "asset": signal.asset})

        message_id = self._notify_trade(record.to_dict())
        notion_page_id = self.notion.create_trade_page(record.to_dict())

        updates: Dict[str, Any] = {}
        if message_id is not None:
            updates["telegram_message_id"] = message_id
        if notion_page_id:
            updates["notion_page_id"] = notion_page_id
        if updates:
            record_payload = self.store.update_trade(signal.trade_id, updates)
        else:
            record_payload = self.store.get_trade(signal.trade_id)
        return record_payload or record.to_dict()

    def record_no_trade(self, payload: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        note = payload or {}
        trade_id = note.get("trade_id") or f"no-trade-{datetime.now(timezone.utc).date().isoformat()}"
        record = {
            "signal": {
                "trade_id": trade_id,
                "asset": note.get("asset", ""),
                "market_context": note.get("market_context", ""),
                "reason": note.get("reason", "No rational trade today"),
            },
            "status": "NO_TRADE",
            "validation_status": "SKIPPED",
            "execution_status": "NOT_EXECUTED",
            "created_at": datetime.now(timezone.utc).replace(microsecond=0).isoformat(),
            "updated_at": datetime.now(timezone.utc).replace(microsecond=0).isoformat(),
        }
        self.store.save_trade(trade_id, record)
        self.store.append_event("no_trade", record["signal"])
        self._notify_no_trade()
        return record

    @staticmethod
    def parse_action(raw_action: str) -> Tuple[str, str]:
        action, separator, trade_id = raw_action.partition(":")
        if not separator or not trade_id:
            raise ValueError("Invalid callback format. Expected ACTION:trade_id.")
        action = action.strip().upper()
        trade_id = trade_id.strip()
        if action not in {"VALIDATE", "REJECT"}:
            raise ValueError("Unsupported action.")
        return action, trade_id

    def handle_callback(self, callback_query: Dict[str, Any]) -> Dict[str, Any]:
        action, trade_id = self.parse_action(callback_query.get("data", ""))
        callback_query_id = callback_query["id"]
        if action == "VALIDATE":
            trade = self.validate_and_execute_trade(trade_id)
            if self.telegram.is_enabled() and not str(callback_query_id).startswith("local-"):
                self.telegram.answer_callback_query(callback_query_id, "Trade valide. Execution en cours.")
        else:
            trade = self.reject_trade(trade_id)
            if self.telegram.is_enabled() and not str(callback_query_id).startswith("local-"):
                self.telegram.answer_callback_query(callback_query_id, "Trade refuse. Aucune execution.")
        return trade

    def reject_trade(self, trade_id: str) -> Dict[str, Any]:
        trade = self.store.get_trade(trade_id)
        if not trade:
            raise KeyError(f"Unknown trade_id: {trade_id}")
        if trade["status"] != "TRADE_PENDING_VALIDATION":
            raise ValueError("Trade is no longer pending validation.")
        updated = self.store.update_trade(
            trade_id,
            {
                "status": "REJECTED",
                "validation_status": "REJECTED",
                "execution_status": "NOT_EXECUTED",
            },
        )
        self.store.append_event("trade_rejected", {"trade_id": trade_id})
        if updated.get("notion_page_id"):
            self.notion.update_trade_page(updated["notion_page_id"], updated)
        return updated

    def validate_and_execute_trade(self, trade_id: str) -> Dict[str, Any]:
        trade = self.store.get_trade(trade_id)
        if not trade:
            raise KeyError(f"Unknown trade_id: {trade_id}")
        if trade["status"] != "TRADE_PENDING_VALIDATION":
            raise ValueError("Trade is no longer pending validation.")

        validated = self.store.update_trade(
            trade_id,
            {
                "status": "VALIDATED",
                "validation_status": "APPROVED",
                "execution_status": "EXECUTION_PENDING",
            },
        )
        self.store.append_event("trade_validated", {"trade_id": trade_id})

        execution = self.executor.execute(validated)
        executed = self.store.update_trade(
            trade_id,
            {
                "status": "SL_TP_PLACED",
                "execution_status": "EXECUTED",
                "execution_details": execution,
            },
        )
        self.store.append_event("trade_executed", {"trade_id": trade_id, "execution": execution})
        if executed.get("notion_page_id"):
            self.notion.update_trade_page(executed["notion_page_id"], executed)
        return executed

    def handle_update(self, payload: Dict[str, Any], secret_token: Optional[str] = None) -> Dict[str, Any]:
        if self.settings.telegram_webhook_secret and self.settings.telegram_webhook_secret != secret_token:
            raise PermissionError("Invalid Telegram secret token.")
        if "callback_query" in payload:
            return self.handle_callback(payload["callback_query"])
        self.store.append_event("telegram_update_ignored", payload)
        return {"status": "ignored"}
