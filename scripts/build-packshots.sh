#!/usr/bin/env bash
set -euo pipefail

project_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

python3 "$project_root/scripts/generate-visuals.py" --assets-only

printf 'Visuels Perlivio reconstruits : 5 packshots, vues solo, hero, Réserve et fermoir.\n'
