import json
import tempfile
import unittest
from pathlib import Path

from trading_agent.config import load_settings
from trading_agent.workflow import TradingWorkflow


class TradingAgentWorkflowTests(unittest.TestCase):
    def setUp(self) -> None:
        self.tempdir = tempfile.TemporaryDirectory()
        self.base_dir = Path(self.tempdir.name)
        (self.base_dir / ".env").write_text(
            "\n".join(
                [
                    "TOTAL_CAPITAL_EUR=1000",
                    "MAX_RISK_PERCENT=1",
                    "MIN_RR=2",
                    "DAILY_TRADE_LIMIT=1",
                ]
            ),
            encoding="utf-8",
        )
        self.settings = load_settings(self.base_dir)
        self.workflow = TradingWorkflow(self.settings)

    def tearDown(self) -> None:
        self.tempdir.cleanup()

    def _payload(self, trade_id: str = "BTC-TEST-001") -> dict:
        return {
            "trade_id": trade_id,
            "asset": "BTCUSDT",
            "timeframe": "H4",
            "market_condition": "Trending",
            "trend": "Bullish",
            "volatility": "Moderate",
            "clarity_level": "High",
            "sources_reviewed": ["A", "B"],
            "assets_mentioned": ["BTC"],
            "social_bias": "Bullish",
            "credibility_assessment": "Aligned",
            "alignment_with_market_structure": "Aligned",
            "setup_type": "Pullback",
            "direction": "LONG",
            "entry": 100,
            "stop_loss": 95,
            "take_profit": 112,
            "risk_reward": 2.4,
            "confluences": ["Support", "EMA", "RSI"],
            "technical_reasons": ["Reason 1", "Reason 2"],
            "social_information_support": ["Support 1"],
            "strength_factors": ["Strength 1"],
            "weakness_factors": ["Weakness 1"],
            "risk_elements": ["Risk 1"],
            "trade_invalid_if": "Support breaks",
            "action_to_take_if_invalid": "Exit",
            "confidence_level": "7/10",
        }

    def test_create_trade_computes_position_size_and_persists(self) -> None:
        trade = self.workflow.create_trade(self._payload())
        self.assertEqual(trade["status"], "TRADE_PENDING_VALIDATION")
        self.assertAlmostEqual(trade["signal"]["position_size"], 2.0)

    def test_reject_trade_updates_status(self) -> None:
        self.workflow.create_trade(self._payload())
        trade = self.workflow.reject_trade("BTC-TEST-001")
        self.assertEqual(trade["status"], "REJECTED")
        self.assertEqual(trade["validation_status"], "REJECTED")

    def test_validate_trade_executes_in_paper_mode(self) -> None:
        self.workflow.create_trade(self._payload())
        trade = self.workflow.validate_and_execute_trade("BTC-TEST-001")
        self.assertEqual(trade["status"], "SL_TP_PLACED")
        self.assertEqual(trade["execution_status"], "EXECUTED")
        self.assertEqual(trade["execution_details"]["mode"], "paper")

    def test_daily_trade_limit_is_enforced(self) -> None:
        self.workflow.create_trade(self._payload())
        with self.assertRaises(ValueError):
            self.workflow.create_trade(self._payload("BTC-TEST-002"))

    def test_no_trade_is_saved(self) -> None:
        record = self.workflow.record_no_trade({"reason": "No rational trade today"})
        self.assertEqual(record["status"], "NO_TRADE")
        state = json.loads(self.settings.state_file.read_text(encoding="utf-8"))
        self.assertIn(record["signal"]["trade_id"], state["trades"])


if __name__ == "__main__":
    unittest.main()

