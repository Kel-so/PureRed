#!/usr/bin/env bash
# Upload encoded media to B2. Only new/changed files are sent; nothing is deleted.
#
#   scripts/upload.sh              uploads media-out/   (output of scripts/encode.sh)
#   scripts/upload.sh site/media   uploads the placeholder media currently served from the repo
set -euo pipefail
. "$(dirname "$0")/_env.sh"
need B2_APPLICATION_KEY_ID B2_APPLICATION_KEY B2_BUCKET
command -v b2 >/dev/null || { echo "b2 CLI not found: pip install b2" >&2; exit 1; }

SRC="${1:-$ROOT/media-out}"
[ -d "$SRC" ] || { echo "nothing to upload: $SRC not found" >&2; exit 1; }

b2 account authorize >/dev/null
b2 sync --no-progress --exclude-regex '(^|.*/)\.DS_Store$' "$SRC" "b2://$B2_BUCKET/"
echo "✓ uploaded $SRC → b2://$B2_BUCKET/"
[ -n "${MEDIA_HOST:-}" ] && echo "  served at https://$MEDIA_HOST/"
exit 0
