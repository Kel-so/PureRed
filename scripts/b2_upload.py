#!/usr/bin/env python3
"""Upload a folder to B2 using the native API (no keys on disk).

Auth comes either from B2_APPLICATION_KEY_ID/B2_APPLICATION_KEY in the environment,
or — in a Claude cloud session — from a network secret that injects the
Authorization header for api.backblazeb2.com.

  python3 scripts/b2_upload.py media-out            # media-out/work/x → work/x
  python3 scripts/b2_upload.py site/media           # placeholders
Skips files already in the bucket with the same SHA-1.
"""
import base64, hashlib, json, mimetypes, os, sys, urllib.parse, urllib.request
from pathlib import Path

BUCKET = os.environ.get("B2_BUCKET", "kelsonfilms-media")

def call(url, data=None, headers=None):
    req = urllib.request.Request(url, data=data, headers=headers or {})
    with urllib.request.urlopen(req, timeout=600) as r:
        return json.load(r)

def main():
    src = Path(sys.argv[1] if len(sys.argv) > 1 else "media-out")
    hdr = {}
    kid, key = os.environ.get("B2_APPLICATION_KEY_ID"), os.environ.get("B2_APPLICATION_KEY")
    if kid and key:
        hdr["Authorization"] = "Basic " + base64.b64encode(f"{kid}:{key}".encode()).decode()
    auth = call("https://api.backblazeb2.com/b2api/v3/b2_authorize_account", headers=hdr)
    api, tok = auth["apiInfo"]["storageApi"]["apiUrl"], auth["authorizationToken"]
    H = {"Authorization": tok}
    post = lambda ep, body: call(f"{api}/b2api/v3/{ep}", json.dumps(body).encode(), H)

    b = post("b2_list_buckets", {"accountId": auth["accountId"], "bucketName": BUCKET})["buckets"]
    if not b: sys.exit(f"bucket {BUCKET} not found")
    bid = b[0]["bucketId"]

    existing, start = {}, None
    while True:
        r = post("b2_list_file_names", {"bucketId": bid, "maxFileCount": 1000, **({"startFileName": start} if start else {})})
        for f in r["files"]:
            existing[f["fileName"]] = f.get("contentSha1")
        start = r.get("nextFileName")
        if not start: break

    up = post("b2_get_upload_url", {"bucketId": bid})
    n = 0
    for p in sorted(x for x in src.rglob("*") if x.is_file() and x.name != ".DS_Store"):
        name = p.relative_to(src).as_posix()
        data = p.read_bytes()
        sha = hashlib.sha1(data).hexdigest()
        if existing.get(name) == sha:
            print("=", name); continue
        ctype = mimetypes.guess_type(name)[0] or "b2/x-auto"
        call(up["uploadUrl"], data, {
            "Authorization": up["authorizationToken"],
            "X-Bz-File-Name": urllib.parse.quote(name),
            "Content-Type": ctype, "Content-Length": str(len(data)), "X-Bz-Content-Sha1": sha,
        })
        n += 1
        print("↑", name, f"{len(data)/1e6:.1f} MB")
    print(f"done: {n} uploaded to b2://{BUCKET}/")

if __name__ == "__main__":
    main()
