#!/usr/bin/env bash
# Encode one portfolio video into the three files the site uses:
#   full.<hash>.mp4   H.264/AAC, max 1080p, faststart — plays in the modal player
#   loop.<hash>.mp4   6 s, muted, ~960px — autoplays in the grid
#   poster.<hash>.jpg first frame of the loop
# Files are written to media-out/work/<id>/ and a work.json snippet is printed.
#
# Usage:
#   scripts/encode.sh <input> <id> [--at SECONDS] [--len SECONDS] [--as before]
#
#   --at      where the grid loop starts (default 3). Pick the strongest 6 seconds.
#   --len     loop length in seconds (default 6)
#   --as before  encode the RAW side of a before/after pair (files get a "before-" prefix)
#
# Example:
#   scripts/encode.sh ~/Exports/ep42_clip3.mp4 podcast-ep42-clip3 --at 1.5
set -euo pipefail
. "$(dirname "$0")/_env.sh"

FFMPEG="${FFMPEG:-ffmpeg}"
FFPROBE="${FFPROBE:-ffprobe}"
command -v "$FFMPEG" >/dev/null || { echo "ffmpeg not found (brew install ffmpeg)" >&2; exit 1; }

IN="${1:?input video}"; ID="${2:?id, e.g. podcast-ep42-clip3}"; shift 2
AT=3; LEN=6; PREFIX=""
while [ $# -gt 0 ]; do
  case "$1" in
    --at) AT="$2"; shift 2 ;;
    --len) LEN="$2"; shift 2 ;;
    --as) [ "$2" = before ] && PREFIX="before-"; shift 2 ;;
    *) echo "unknown option $1" >&2; exit 1 ;;
  esac
done
[[ "$ID" =~ ^[a-z0-9-]+$ ]] || { echo "id must be lowercase letters, numbers and dashes" >&2; exit 1; }

OUT="$ROOT/media-out/work/$ID"
TMP="$(mktemp -d)"; trap 'rm -rf "$TMP"' EXIT
mkdir -p "$OUT"

# long side capped, short side follows; even dimensions for yuv420p
fit() { echo "scale='if(gte(iw,ih),min($1,iw),-2)':'if(gte(iw,ih),-2,min($1,ih))',scale=trunc(iw/2)*2:trunc(ih/2)*2"; }

echo "→ full"
"$FFMPEG" -hide_banner -loglevel error -y -i "$IN" \
  -map 0:v:0 -map '0:a:0?' -vf "$(fit 1920)" \
  -c:v libx264 -preset slow -crf 20 -profile:v high -pix_fmt yuv420p -maxrate 10M -bufsize 20M \
  -c:a aac -b:a 160k -ac 2 -movflags +faststart "$TMP/full.mp4"

echo "→ loop (${LEN}s from ${AT}s)"
"$FFMPEG" -hide_banner -loglevel error -y -ss "$AT" -t "$LEN" -i "$IN" \
  -an -vf "$(fit 960),fps=30" \
  -c:v libx264 -preset slow -crf 26 -profile:v high -pix_fmt yuv420p -movflags +faststart "$TMP/loop.mp4"

echo "→ poster"
"$FFMPEG" -hide_banner -loglevel error -y -i "$TMP/loop.mp4" -frames:v 1 -q:v 3 "$TMP/poster.jpg"

# content hash in the name → files can be cached forever by Cloudflare
put() { local h; h="$(shasum -a 1 "$TMP/$1.$2" 2>/dev/null || sha1sum "$TMP/$1.$2")"; h="${h:0:8}"
        mv "$TMP/$1.$2" "$OUT/$PREFIX$1.$h.$2"; echo "work/$ID/$PREFIX$1.$h.$2"; }
FULL="$(put full mp4)"; LOOP="$(put loop mp4)"; POSTER="$(put poster jpg)"

read -r W H < <("$FFPROBE" -v error -select_streams v:0 -show_entries stream=width,height -of default=nw=1:nk=1 "$ROOT/media-out/$FULL" | paste -sd' ' -)
DUR="$("$FFPROBE" -v error -show_entries format=duration -of default=nw=1:nk=1 "$IN")"
FORMAT="$(awk -v w="$W" -v h="$H" 'BEGIN{r=w/h; print (r>1.2?"16:9":(r<0.8?"9:16":"1:1"))}')"
DURTXT="$(awk -v d="$DUR" 'BEGIN{d=int(d+.5); printf "%d:%02d", d/60, d%60}')"

echo
echo "Done → media-out/work/$ID/  (${W}x${H}, $FORMAT, $DURTXT)"
echo
if [ -n "$PREFIX" ]; then
  echo "Add to the before/after item in site/data/work.json:"
  cat <<JSON
      "before": { "loop": "$LOOP", "poster": "$POSTER", "full": "$FULL" },
JSON
else
  echo "Paste into \"items\" in site/data/work.json (fill section, title, client, role, metrics):"
  cat <<JSON
    {
      "id": "$ID",
      "section": "clips",
      "title": { "en": "", "pt": "" },
      "client": "",
      "year": $(date +%Y),
      "format": "$FORMAT",
      "duration": "$DURTXT",
      "role": { "en": "", "pt": "" },
      "metrics": [],
      "media": { "loop": "$LOOP", "poster": "$POSTER", "full": "$FULL" },
      "youtube": null
    },
JSON
fi
echo
echo "Then: scripts/upload.sh"
