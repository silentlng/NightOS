from __future__ import annotations

import json
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from typing import Any, Dict

from .config import load_settings
from .workflow import TradingWorkflow


class TradingAgentHandler(BaseHTTPRequestHandler):
    workflow = TradingWorkflow(load_settings())

    def _read_json(self) -> Dict[str, Any]:
        content_length = int(self.headers.get("Content-Length", "0"))
        raw_body = self.rfile.read(content_length) if content_length else b"{}"
        return json.loads(raw_body.decode("utf-8"))

    def _send(self, status: int, payload: Dict[str, Any]) -> None:
        body = json.dumps(payload, ensure_ascii=True).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self) -> None:  # noqa: N802
        if self.path == "/health":
            self._send(HTTPStatus.OK, {"ok": True})
            return
        self._send(HTTPStatus.NOT_FOUND, {"ok": False, "error": "Not found"})

    def do_POST(self) -> None:  # noqa: N802
        try:
            payload = self._read_json()
            if self.path == "/api/signal":
                trade = self.workflow.create_trade(payload)
                self._send(HTTPStatus.CREATED, {"ok": True, "trade": trade})
                return
            if self.path == "/api/no-trade":
                record = self.workflow.record_no_trade(payload)
                self._send(HTTPStatus.CREATED, {"ok": True, "record": record})
                return
            if self.path == "/telegram/webhook":
                trade = self.workflow.handle_update(
                    payload, secret_token=self.headers.get("X-Telegram-Bot-Api-Secret-Token")
                )
                self._send(HTTPStatus.OK, {"ok": True, "result": trade})
                return
            self._send(HTTPStatus.NOT_FOUND, {"ok": False, "error": "Not found"})
        except PermissionError as exc:
            self._send(HTTPStatus.FORBIDDEN, {"ok": False, "error": str(exc)})
        except (KeyError, ValueError) as exc:
            self._send(HTTPStatus.BAD_REQUEST, {"ok": False, "error": str(exc)})
        except Exception as exc:  # pragma: no cover
            self._send(HTTPStatus.INTERNAL_SERVER_ERROR, {"ok": False, "error": str(exc)})


def run_server() -> None:
    settings = load_settings()
    TradingAgentHandler.workflow = TradingWorkflow(settings)
    server = ThreadingHTTPServer((settings.host, settings.port), TradingAgentHandler)
    print(f"Trading agent listening on http://{settings.host}:{settings.port}")
    server.serve_forever()


if __name__ == "__main__":
    run_server()

