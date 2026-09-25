#!/usr/bin/env bash
# One-time Backblaze B2 setup: creates the public media bucket and an upload-only key.
# Needs the B2 CLI:  pip install b2   (or: brew install b2-tools)
# Needs in .env:     B2_APPLICATION_KEY_ID / B2_APPLICATION_KEY (master key), B2_BUCKET
set -euo pipefail
. "$(dirname "$0")/_env.sh"
need B2_APPLICATION_KEY_ID B2_APPLICATION_KEY B2_BUCKET
command -v b2 >/dev/null || { echo "b2 CLI not found: pip install b2" >&2; exit 1; }

b2 account authorize >/dev/null
echo "✓ authorized"

CORS='[{"corsRuleName":"site","allowedOrigins":["*"],"allowedOperations":["b2_download_file_by_name"],"allowedHeaders":["range"],"exposeHeaders":["content-length","content-range"],"maxAgeSeconds":86400}]'
# Replaced files: old versions are hidden on upload and deleted a day later (keeps storage = what the site uses)
LIFECYCLE='{"daysFromHidingToDeleting":1,"daysFromUploadingToHiding":null,"fileNamePrefix":""}'

if b2 bucket get "$B2_BUCKET" >/dev/null 2>&1; then
  echo "✓ bucket $B2_BUCKET already exists — updating settings"
  b2 bucket update --cors-rules "$CORS" --lifecycle-rule "$LIFECYCLE" "$B2_BUCKET" allPublic >/dev/null
else
  b2 bucket create --cors-rules "$CORS" --lifecycle-rule "$LIFECYCLE" "$B2_BUCKET" allPublic >/dev/null
  echo "✓ bucket $B2_BUCKET created (public)"
fi

echo
echo "Upload-only key for scripts/upload.sh (shown once — put it in .env in place of the master key):"
b2 key create --bucket "$B2_BUCKET" "${B2_BUCKET}-upload" listBuckets,listFiles,readFiles,writeFiles

DL="$(b2 account get | sed -n 's/.*"downloadUrl": *"https:\/\/\([^"]*\)".*/\1/p' | head -1)"
echo
echo "B2_DOWNLOAD_HOST=$DL        ← put this in .env (used by scripts/cloudflare-setup.sh)"
echo "Direct test URL:  https://$DL/file/$B2_BUCKET/<path>"
