#!/usr/bin/env bash
# One-time Cloudflare setup so https://$MEDIA_HOST/<path> serves b2://$B2_BUCKET/<path>
# through Cloudflare's cache (B2 → Cloudflare egress is free under the Bandwidth Alliance).
#
# Creates / updates, all tagged "purered_media_*" so re-running is safe and other rules are kept:
#   1. DNS     CNAME $MEDIA_HOST → $B2_DOWNLOAD_HOST (proxied, orange cloud)
#   2. Rewrite /path → /file/$B2_BUCKET/path (hides the B2 bucket path)
#   3. Cache   edge 30 days, browser 1 year (file names carry a content hash)
#   4. Headers strip x-bz-* headers, add CORS
#
# API token permissions (dash.cloudflare.com → My Profile → API Tokens → Create Custom Token),
# all scoped to the zone:  Zone: DNS Edit · Zone: Transform Rules Edit · Zone: Cache Rules Edit
set -euo pipefail
. "$(dirname "$0")/_env.sh"
need CF_API_TOKEN CF_ZONE_ID MEDIA_HOST B2_DOWNLOAD_HOST B2_BUCKET
command -v jq >/dev/null || { echo "jq not found (brew install jq)" >&2; exit 1; }

API="https://api.cloudflare.com/client/v4/zones/$CF_ZONE_ID"
cf() { # method path [json]
  local out
  out="$(curl -sS -X "$1" "$API$2" -H "Authorization: Bearer $CF_API_TOKEN" -H "Content-Type: application/json" ${3:+--data "$3"})"
  if [ "$(jq -r '.success' <<<"$out")" != "true" ]; then echo "Cloudflare API error on $1 $2:" >&2; jq '.errors' <<<"$out" >&2; return 1; fi
  echo "$out"
}

# 1. DNS
REC="$(cf GET "/dns_records?type=CNAME&name=$MEDIA_HOST" | jq -r '.result[0].id // empty')"
BODY="$(jq -nc --arg n "$MEDIA_HOST" --arg c "$B2_DOWNLOAD_HOST" '{type:"CNAME",name:$n,content:$c,proxied:true,ttl:1,comment:"PureRed media → Backblaze B2"}')"
if [ -n "$REC" ]; then cf PATCH "/dns_records/$REC" "$BODY" >/dev/null; else cf POST "/dns_records" "$BODY" >/dev/null; fi
echo "✓ DNS  $MEDIA_HOST → $B2_DOWNLOAD_HOST (proxied)"

# upsert one rule (matched by ref) into a phase entrypoint, keeping every other rule
upsert() { # phase rule-json
  local cur rules
  cur="$(curl -sS "$API/rulesets/phases/$1/entrypoint" -H "Authorization: Bearer $CF_API_TOKEN")"
  rules="$(jq -c --argjson r "$2" '[(.result.rules // [])[] | select(.ref != $r.ref) | del(.version, .last_updated)] + [$r]' <<<"$cur")"
  cf PUT "/rulesets/phases/$1/entrypoint" "$(jq -nc --argjson rules "$rules" '{rules:$rules}')" >/dev/null
}

HOST_EXPR="(http.host eq \"$MEDIA_HOST\")"

upsert http_request_transform "$(jq -nc --arg e "$HOST_EXPR and not starts_with(http.request.uri.path, \"/file/\")" --arg b "$B2_BUCKET" '{
  ref:"purered_media_rewrite", description:"PureRed media: map to B2 bucket path", enabled:true, expression:$e,
  action:"rewrite", action_parameters:{uri:{path:{expression:("concat(\"/file/" + $b + "\", http.request.uri.path)")}}}}')"
echo "✓ URL rewrite  /… → /file/$B2_BUCKET/…"

upsert http_request_cache_settings "$(jq -nc --arg e "$HOST_EXPR" '{
  ref:"purered_media_cache", description:"PureRed media: cache everything", enabled:true, expression:$e,
  action:"set_cache_settings", action_parameters:{cache:true,
    edge_ttl:{mode:"override_origin",default:2592000}, browser_ttl:{mode:"override_origin",default:31536000}}}')"
echo "✓ Cache rule   edge 30d / browser 1y"

upsert http_response_headers_transform "$(jq -nc --arg e "$HOST_EXPR" '{
  ref:"purered_media_headers", description:"PureRed media: clean B2 headers", enabled:true, expression:$e,
  action:"rewrite", action_parameters:{headers:{
    "x-bz-file-name":{operation:"remove"}, "x-bz-file-id":{operation:"remove"},
    "x-bz-content-sha1":{operation:"remove"}, "x-bz-upload-timestamp":{operation:"remove"},
    "x-bz-info-src_last_modified_millis":{operation:"remove"},
    "Access-Control-Allow-Origin":{operation:"set",value:"*"}}}}')"
echo "✓ Response headers cleaned"

echo
echo "Test (after the first upload):  curl -I https://$MEDIA_HOST/work/reel/loop.mp4"
echo "Then set \"mediaBase\": \"https://$MEDIA_HOST/\" in site/data/site.json"
