#!/usr/bin/env bash
# Point the site at the B2/Cloudflare media host (or back to the repo with "local").
#   scripts/set-media-host.sh              uses MEDIA_HOST from .env
#   scripts/set-media-host.sh local        serves from site/media/ again
set -euo pipefail
. "$(dirname "$0")/_env.sh"
if [ "${1:-}" = local ]; then BASE="media/"; else need MEDIA_HOST; BASE="https://${1:-$MEDIA_HOST}/"; fi
python3 - "$ROOT/site/data/site.json" "$BASE" <<'PY'
import json, sys
p, base = sys.argv[1], sys.argv[2]
d = json.load(open(p, encoding="utf-8"))
d["mediaBase"] = base
open(p, "w", encoding="utf-8").write(json.dumps(d, ensure_ascii=False, indent=2) + "\n")
print(f"mediaBase = {base}")
PY
