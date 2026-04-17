#!/bin/sh
set -eu

export LC_ALL=C
export LANG=C

ROOT_DIR="$(CDPATH= cd -- "$(dirname "$0")/.." && pwd)"
DEST_DIR="/Users/lng/Desktop/NIGHTOS"

mkdir -p "$DEST_DIR"

find "$DEST_DIR" -mindepth 1 ! -name '.DS_Store' -exec rm -rf {} +

git -C "$ROOT_DIR" archive --format=tar HEAD | tar -xf - -C "$DEST_DIR"

printf 'Exported tracked repository contents to %s\n' "$DEST_DIR"
