# Loads ../.env into the environment (sourced by the other scripts).
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
if [ -f "$ROOT/.env" ]; then
  set -a; . "$ROOT/.env"; set +a
fi
need() { for v in "$@"; do [ -n "${!v:-}" ] || { echo "Missing $v (set it in .env)" >&2; exit 1; }; done; }
