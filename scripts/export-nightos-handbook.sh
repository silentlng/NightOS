#!/bin/sh
set -eu

ROOT_DIR="$(CDPATH= cd -- "$(dirname "$0")/.." && pwd)"
SOURCE_FILE="$ROOT_DIR/docs/nightos-handbook.md"
DEST_DIR="/Users/lng/Desktop/NIGHTOS"
DEST_FILE="$DEST_DIR/NIGHTOS Handbook.md"

mkdir -p "$DEST_DIR"
cp "$SOURCE_FILE" "$DEST_FILE"

printf 'Exported %s -> %s\n' "$SOURCE_FILE" "$DEST_FILE"
