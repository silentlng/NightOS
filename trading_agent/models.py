from __future__ import annotations

from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from uuid import uuid4


VALID_STATUSES = {
    "SCANNED",
    "NO_TRADE",
    "TRADE_PENDING_VALIDATION",
    "VALIDATED",
    "REJECTED",
    "ORDER_SENT",
    "ORDER_CONFIRMED",
    "SL_TP_PLACED",
    "CLOSED",
    "REVIEWED",
}


def utc_now_iso() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def _as_list(value: Any) -> List[str]:
    if value is None:
        return []
    if isinstance(value, list):
        return [str(item).strip() for item in value if str(item).strip()]
    return [part.strip() for part in str(value).split(",") if part.strip()]


@dataclass
class TradeSignal:
    trade_id: str
    asset: str
    timeframe: str
    market_condition: str
    trend: str
    volatility: str
    clarity_level: str
    sources_reviewed: List[str]
    assets_mentioned: List[str]
    social_bias: str
    credibility_assessment: str
    alignment_with_market_structure: str
    setup_type: str
    direction: str
    entry: float
    stop_loss: float
    take_profit: float
    risk_reward: float
    position_size: Optional[float]
    confluences: List[str]
    technical_reasons: List[str]
    social_information_support: List[str]
    strength_factors: List[str]
    weakness_factors: List[str]
    risk_elements: List[str]
    why_manual_validation_required: str
    control_question_before_execution: str
    trade_invalid_if: str
    action_to_take_if_invalid: str
    confidence_level: str
    risk_percent: float
    total_capital_eur: float
    created_at: str = field(default_factory=utc_now_iso)

    @classmethod
    def from_payload(
        cls, payload: Dict[str, Any], default_capital: float, default_risk_percent: float
    ) -> "TradeSignal":
        return cls(
            trade_id=str(payload.get("trade_id") or f"trade-{uuid4().hex[:10]}"),
            asset=str(payload["asset"]).upper(),
            timeframe=str(payload["timeframe"]).upper(),
            market_condition=str(payload["market_condition"]),
            trend=str(payload["trend"]),
            volatility=str(payload["volatility"]),
            clarity_level=str(payload["clarity_level"]),
            sources_reviewed=_as_list(payload.get("sources_reviewed")),
            assets_mentioned=_as_list(payload.get("assets_mentioned")),
            social_bias=str(payload["social_bias"]),
            credibility_assessment=str(payload["credibility_assessment"]),
            alignment_with_market_structure=str(payload["alignment_with_market_structure"]),
            setup_type=str(payload["setup_type"]),
            direction=str(payload["direction"]).upper(),
            entry=float(payload["entry"]),
            stop_loss=float(payload["stop_loss"]),
            take_profit=float(payload["take_profit"]),
            risk_reward=float(payload["risk_reward"]),
            position_size=(
                None
                if payload.get("position_size") in (None, "")
                else float(payload["position_size"])
            ),
            confluences=_as_list(payload.get("confluences")),
            technical_reasons=_as_list(payload.get("technical_reasons")),
            social_information_support=_as_list(payload.get("social_information_support")),
            strength_factors=_as_list(payload.get("strength_factors")),
            weakness_factors=_as_list(payload.get("weakness_factors")),
            risk_elements=_as_list(payload.get("risk_elements")),
            why_manual_validation_required=str(
                payload.get(
                    "why_manual_validation_required",
                    "Aucun ordre live ne doit partir sans validation humaine explicite.",
                )
            ),
            control_question_before_execution=str(
                payload.get(
                    "control_question_before_execution",
                    "Confirmer que le contexte de marche est toujours valide et que le risque est accepte.",
                )
            ),
            trade_invalid_if=str(payload["trade_invalid_if"]),
            action_to_take_if_invalid=str(payload["action_to_take_if_invalid"]),
            confidence_level=str(payload["confidence_level"]),
            risk_percent=float(payload.get("risk_percent", default_risk_percent)),
            total_capital_eur=float(payload.get("total_capital_eur", default_capital)),
        )

    def compute_position_size(self) -> float:
        risk_amount = self.total_capital_eur * (self.risk_percent / 100.0)
        stop_distance = abs(self.entry - self.stop_loss)
        if stop_distance <= 0:
            raise ValueError("Stop loss distance must be positive.")
        return risk_amount / stop_distance

    def validate(self, min_rr: float, max_risk_percent: float) -> None:
        if self.direction not in {"LONG", "SHORT"}:
            raise ValueError("Direction must be LONG or SHORT.")
        if self.entry <= 0 or self.stop_loss <= 0 or self.take_profit <= 0:
            raise ValueError("Entry, stop loss, and take profit must be positive.")
        if self.risk_reward < min_rr:
            raise ValueError(f"Risk/reward must be >= {min_rr}.")
        if self.risk_percent <= 0 or self.risk_percent > max_risk_percent:
            raise ValueError(f"Risk percent must be > 0 and <= {max_risk_percent}.")
        if len(self.confluences) < 3:
            raise ValueError("At least three confluences are required.")
        if self.direction == "LONG":
            if not (self.stop_loss < self.entry < self.take_profit):
                raise ValueError("LONG setup must satisfy stop < entry < take profit.")
        if self.direction == "SHORT":
            if not (self.take_profit < self.entry < self.stop_loss):
                raise ValueError("SHORT setup must satisfy take profit < entry < stop.")

    def to_dict(self) -> Dict[str, Any]:
        data = asdict(self)
        data["position_size"] = self.position_size if self.position_size is not None else self.compute_position_size()
        return data


@dataclass
class TradeRecord:
    signal: Dict[str, Any]
    status: str
    validation_status: str
    execution_status: str
    created_at: str
    updated_at: str
    notion_page_id: Optional[str] = None
    telegram_message_id: Optional[int] = None
    execution_details: Dict[str, Any] = field(default_factory=dict)
    result: Optional[str] = None
    lesson_learned: str = ""

    def to_dict(self) -> Dict[str, Any]:
        payload = asdict(self)
        payload["signal"] = dict(self.signal)
        return payload


def make_trade_record(signal: TradeSignal) -> TradeRecord:
    now = utc_now_iso()
    return TradeRecord(
        signal=signal.to_dict(),
        status="TRADE_PENDING_VALIDATION",
        validation_status="PENDING",
        execution_status="NOT_EXECUTED",
        created_at=now,
        updated_at=now,
    )

