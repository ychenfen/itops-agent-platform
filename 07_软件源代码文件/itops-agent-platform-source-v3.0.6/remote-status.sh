#!/usr/bin/env bash
set -u

ROOT_DIR="${HOME}/itops-agent-platform"
REPORT="/tmp/VM0000810055-status-$(date +%Y%m%d-%H%M%S).txt"

{
  echo "checked_at=$(date -Is)"
  echo "kernel=$(uname -a)"
  echo "node=$(node --version 2>&1 || true)"
  echo "npm=$(npm --version 2>&1 || true)"
  echo "bootstrap_processes:"
  ps -ef | grep -E 'deploy-remote-lab|npm (install|run)|node|vite|tsx' | grep -v grep || true
  echo "services:"
  systemctl is-enabled itops-agent-backend.service itops-agent-frontend.service 2>&1 || true
  systemctl is-active itops-agent-backend.service itops-agent-frontend.service 2>&1 || true
  echo "ports:"
  ss -lntp 2>&1 | grep -E ':(3001|3002)\b' || true
  echo "bootstrap_log:"
  tail -n 120 /tmp/d.log 2>&1 || true
  echo "backend_log:"
  journalctl --no-pager -u itops-agent-backend.service -n 60 2>&1 || true
  echo "frontend_log:"
  journalctl --no-pager -u itops-agent-frontend.service -n 60 2>&1 || true
} >"${REPORT}"

TOKEN="${GH_TOKEN:-$(cat "${HOME}/.ght" 2>/dev/null || true)}"
[ -n "${TOKEN}" ] || exit 2
CONTENT=$(base64 -w 0 "${REPORT}" 2>/dev/null || base64 "${REPORT}" | tr -d '\n')
NAME=$(basename "${REPORT}")
curl -fsS -X PUT \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Accept: application/vnd.github+json" \
  -H "X-GitHub-Api-Version: 2022-11-28" \
  "https://api.github.com/repos/youxiandechilun/itops-agent-platform/contents/deployments/${NAME}" \
  -d "{\"message\":\"chore: record remote status\",\"content\":\"${CONTENT}\"}" \
  >/dev/null
