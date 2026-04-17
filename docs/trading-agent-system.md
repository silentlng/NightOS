# Trading Agent System

## Vue d'ensemble

Cette base ajoute un service local Python pour piloter :

- la reception d'un signal elite
- l'envoi Telegram avec boutons `VALIDATE` et `REJECT`
- la machine d'etat du trade
- le journal local JSON
- l'execution en `paper mode` par defaut
- l'execution Binance Futures testnet si les cles sont configurees
- la synchronisation Notion si le token et la base sont renseignes

Le service expose trois endpoints HTTP :

- `GET /health`
- `POST /api/signal`
- `POST /api/no-trade`
- `POST /telegram/webhook`

## Fichiers importants

- `trading_agent/server.py`
- `trading_agent/workflow.py`
- `trading_agent/executor.py`
- `trading_agent/notion_client.py`
- `trading_agent/telegram_client.py`
- `data/trading-agent/state.json`
- `data/trading-agent/journal.jsonl`

## Variables d'environnement

Renseigne au minimum :

```bash
TELEGRAM_BOT_TOKEN=...
TELEGRAM_CHAT_ID=1014289867
TOTAL_CAPITAL_EUR=1000
MAX_RISK_PERCENT=1
MIN_RR=2
BINANCE_MODE=paper
```

Pour Telegram webhook :

```bash
TELEGRAM_WEBHOOK_SECRET=change_me
APP_BASE_URL=https://your-public-url.example
TRADING_AGENT_HOST=127.0.0.1
TRADING_AGENT_PORT=8787
```

Pour Notion :

```bash
NOTION_TOKEN=secret_xxx
NOTION_DATABASE_ID=xxxxxxxx
NOTION_PARENT_PAGE_ID=xxxxxxxx
```

Pour Binance testnet :

```bash
BINANCE_MODE=binance_futures_testnet
BINANCE_API_KEY=...
BINANCE_API_SECRET=...
BINANCE_FUTURES_TESTNET_URL=https://demo-fapi.binance.com
```

## Demarrage local

Depuis le dossier projet :

```bash
cd /Users/lng/Documents/Playground
python3 -m trading_agent serve
```

Health check :

```bash
curl http://127.0.0.1:8787/health
```

## Verifier les connexions

Notion :

```bash
python3 -m trading_agent check-notion
```

Bootstrap d'une base Notion sous une page parent :

```bash
python3 -m trading_agent bootstrap-notion-db YOUR_PARENT_PAGE_ID --title "LNG Trading Journal"
```

Binance Futures testnet :

```bash
BINANCE_MODE=binance_futures_testnet python3 -m trading_agent check-binance
```

## Envoi d'un signal

Exemple :

```bash
curl -X POST http://127.0.0.1:8787/api/signal \
  -H "Content-Type: application/json" \
  -d '{
    "trade_id": "BTC-2026-04-01-01",
    "asset": "BTCUSDT",
    "timeframe": "H4",
    "market_condition": "Trending market with pullback",
    "trend": "Bullish on H4 and D1",
    "volatility": "Moderate",
    "clarity_level": "High",
    "sources_reviewed": ["Rekt Capital", "CrediBULL Crypto"],
    "assets_mentioned": ["BTC"],
    "social_bias": "Bullish",
    "credibility_assessment": "Specific levels shared",
    "alignment_with_market_structure": "Aligned",
    "setup_type": "Pullback continuation",
    "direction": "LONG",
    "entry": 62500,
    "stop_loss": 61800,
    "take_profit": 64200,
    "risk_reward": 2.4,
    "confluences": ["Support H4", "EMA alignment", "RSI recovery"],
    "technical_reasons": ["Support reclaim", "Trend intact", "Clean invalidation"],
    "social_information_support": ["Whitelist aligned", "Concrete levels provided"],
    "strength_factors": ["High timeframe alignment", "Clear stop", "RR above threshold"],
    "weakness_factors": ["Setup fails if H4 support breaks"],
    "risk_elements": ["Macro news volatility"],
    "trade_invalid_if": "H4 close below 61800",
    "action_to_take_if_invalid": "Cancel trade or exit immediately",
    "confidence_level": "7.5/10"
  }'
```

## Callback Telegram

Le bouton inline renvoie :

- `VALIDATE:<trade_id>`
- `REJECT:<trade_id>`

Quand le callback arrive sur `/telegram/webhook` :

- le trade doit etre `TRADE_PENDING_VALIDATION`
- `VALIDATE` execute le trade via l'executor actif
- `REJECT` bloque toute execution

## Scenarios Make recommandes

### Scenario 1 - Daily Scan

- Scheduler `08:00`
- Binance market data
- X whitelist social data
- OpenAI prompt
- Router :
- si aucun setup : `POST /api/no-trade`
- si un setup : `POST /api/signal`

### Scenario 2 - Telegram Validation

- Telegram Bot webhook
- Router sur `callback_query.data`
- Forward complet du payload vers `POST /telegram/webhook`

### Scenario 3 - Tracking

- Lire les trades depuis `data/trading-agent/state.json` ou Notion
- mettre a jour le resultat
- calculer le PnL
- marquer `CLOSED`

### Scenario 4 - Weekly Review

- compter les setups detectes
- compter les trades approuves
- compter les trades executes
- calculer win rate reel
- calculer RR moyen
- calculer drawdown
- identifier les sources utiles et inutiles

## Notion

Base recommandee :

- `Trade ID` en titre
- `Date` en date
- `Asset` en texte
- `Direction` en select
- `Timeframe` en texte
- `Status` en select
- `Validation` en select
- `Execution` en select
- `Risk %` en nombre
- `Risk/Reward` en nombre
- `Entry` en nombre
- `Stop Loss` en nombre
- `Take Profit` en nombre
- `Confidence` en texte

Si tu n'as pas encore la base, tu peux la creer avec `bootstrap-notion-db`, puis recopier l'ID retourne dans `NOTION_DATABASE_ID`.

## Mode d'execution

`paper`

- mode par defaut
- aucun ordre reel
- utile pour valider le workflow

`binance_futures_testnet`

- envoie un ordre `MARKET`
- place un `STOP_MARKET`
- place un `TAKE_PROFIT_MARKET`
- necessite des cles Binance testnet

## Garde-fous

- max `1` trade par jour
- validation humaine obligatoire
- refus si le trade n'est plus pending
- refusal si `RR < MIN_RR`
- refus si moins de `3` confluences
- refus si `risk_percent > MAX_RISK_PERCENT`
