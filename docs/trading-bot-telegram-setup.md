# Setup Telegram

## 1. Regenerer le token

Le token colle plus haut dans le chat doit etre considere comme expose.

Genere un nouveau token avec `@BotFather`, puis exporte-le en local :

```bash
export TELEGRAM_BOT_TOKEN="your_new_token"
```

Optionnel :

```bash
cp .env.example .env
```

## 2. Recuperer le chat_id

1. Ouvre ton bot dans Telegram.
2. Clique sur `Start` ou envoie un message comme `hello`.
3. Lance :

```bash
./scripts/telegram-get-updates.sh
```

Dans la reponse JSON, cherche :

- `message.chat.id`

Cette valeur est ton `TELEGRAM_CHAT_ID`.

Exemple :

```bash
export TELEGRAM_CHAT_ID="123456789"
```

## 3. Envoyer un message test

```bash
./scripts/telegram-send-test.sh
```

Ou :

```bash
./scripts/telegram-send-test.sh 123456789 "Bot Telegram OK"
```

## 4. Envoyer un apercu de trade avec boutons

```bash
./scripts/telegram-send-trade-demo.sh
```

Ou :

```bash
./scripts/telegram-send-trade-demo.sh 123456789 BTC-2026-04-01-01
```

Ce script envoie deux boutons inline :

- `VALIDATE`
- `REJECT`

Le format du callback est :

- `VALIDATE:<trade_id>`
- `REJECT:<trade_id>`

## 5. Flux Make recommande

Quand Telegram renvoie un callback :

1. Parser `callback_query.data`
2. Decouper sur `:`
3. Extraire `action` et `trade_id`
4. Rechercher le trade dans Notion ou dans ton datastore
5. Verifier que le statut est `TRADE_PENDING_VALIDATION`
6. Si l'action est `VALIDATE`, continuer vers l'execution Binance
7. Si l'action est `REJECT`, marquer le trade comme refuse

## 6. Garde-fous importants

- Ne jamais mettre le token en dur dans les scenarios Make
- Ne jamais executer a partir d'un simple texte `VALIDATE` sans `trade_id`
- Utiliser Binance testnet au debut
- Logger chaque callback recu
- Refuser l'execution si le trade n'est plus en statut pending
