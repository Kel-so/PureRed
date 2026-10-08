#!/usr/bin/env bash
# Stamp site/index.html with a content hash for the CSS/JS (assets/site.css?v=abc123)
# so browsers always load the version that matches the page. Run before committing
# a change to site/assets/.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
for f in site.css site.js; do
  h="$( (sha1sum "$ROOT/site/assets/$f" 2>/dev/null || shasum -a 1 "$ROOT/site/assets/$f") | cut -c1-8)"
  sed -i.bak -E "s#assets/$f(\?v=[0-9a-f]+)?\"#assets/$f?v=$h\"#" "$ROOT/site/index.html"
  echo "$f → v=$h"
done
rm -f "$ROOT/site/index.html.bak"
