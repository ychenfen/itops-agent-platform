#!/usr/bin/env bash
set -u

ROOT_DIR="${HOME}/itops-agent-platform"
REPORT_DIR="${ROOT_DIR}/deployments"
REPORT_FILE="${REPORT_DIR}/VM0000810055-$(date +%Y%m%d-%H%M%S).txt"
RUNTIME_LOG="${ROOT_DIR}/deploy-runtime.log"
BACKEND_UNIT="/etc/systemd/system/itops-agent-backend.service"
FRONTEND_UNIT="/etc/systemd/system/itops-agent-frontend.service"

mkdir -p "${REPORT_DIR}"
exec > >(tee -a "${REPORT_FILE}") 2>&1

echo "deployment_started=$(date -Is)"
echo "host=$(hostname)"
echo "kernel=$(uname -a)"
echo "arch=$(uname -m)"

install_runtime() {
  if command -v npm >/dev/null 2>&1; then
    return 0
  fi

  local manager=""
  if command -v dnf >/dev/null 2>&1; then
    manager="dnf"
  elif command -v yum >/dev/null 2>&1; then
    manager="yum"
  else
    echo "error=no_supported_package_manager"
    return 1
  fi

  printf '%s\n' "${SUDO_PASSWORD:-}" | sudo -S "$manager" install -y nodejs npm gcc gcc-c++ make python3 git curl
}

upload_report() {
  [ -n "${GH_TOKEN:-}" ] || return 0
  command -v curl >/dev/null 2>&1 || return 0

  local relative_path payload
  relative_path="deployments/$(basename "${REPORT_FILE}")"
  payload=$(base64 -w 0 "${REPORT_FILE}" 2>/dev/null || base64 "${REPORT_FILE}" | tr -d '\n')
  curl -fsS -X PUT \
    -H "Authorization: Bearer ${GH_TOKEN}" \
    -H "Accept: application/vnd.github+json" \
    -H "X-GitHub-Api-Version: 2022-11-28" \
    "https://api.github.com/repos/youxiandechilun/itops-agent-platform/contents/${relative_path}" \
    -d "{\"message\":\"chore: record lab deployment\",\"content\":\"${payload}\"}" \
    >/dev/null 2>&1 || true
}

trap upload_report EXIT

install_runtime || exit 10
echo "node=$(node --version 2>&1)"
echo "npm=$(npm --version 2>&1)"
echo "git=$(git --version 2>&1)"

cd "${ROOT_DIR}"
export HUSKY=0
npm install --no-audit --no-fund
npm --prefix backend install --no-audit --no-fund
npm --prefix frontend install --no-audit --no-fund

pkill -f "tsx watch src/app.ts" 2>/dev/null || true
pkill -f "vite.*--host" 2>/dev/null || true

NPM_BIN=$(command -v npm)
{
  echo '[Unit]'
  echo 'Description=ITOps Agent Platform Backend'
  echo 'After=network-online.target'
  echo 'Wants=network-online.target'
  echo '[Service]'
  echo 'Type=simple'
  echo 'User=vmuser'
  echo "WorkingDirectory=${ROOT_DIR}/backend"
  echo "ExecStart=${NPM_BIN} run dev"
  echo 'Restart=always'
  echo 'RestartSec=5'
  echo 'Environment=NODE_ENV=development'
  echo '[Install]'
  echo 'WantedBy=multi-user.target'
} > /tmp/itops-agent-backend.service

{
  echo '[Unit]'
  echo 'Description=ITOps Agent Platform Frontend'
  echo 'After=network-online.target itops-agent-backend.service'
  echo 'Wants=network-online.target'
  echo '[Service]'
  echo 'Type=simple'
  echo 'User=vmuser'
  echo "WorkingDirectory=${ROOT_DIR}/frontend"
  echo "ExecStart=${NPM_BIN} run dev -- --host 0.0.0.0 --port 3002"
  echo 'Restart=always'
  echo 'RestartSec=5'
  echo '[Install]'
  echo 'WantedBy=multi-user.target'
} > /tmp/itops-agent-frontend.service

printf '%s\n' "${SUDO_PASSWORD:-}" | sudo -S cp /tmp/itops-agent-backend.service "${BACKEND_UNIT}"
printf '%s\n' "${SUDO_PASSWORD:-}" | sudo -S cp /tmp/itops-agent-frontend.service "${FRONTEND_UNIT}"
printf '%s\n' "${SUDO_PASSWORD:-}" | sudo -S systemctl daemon-reload
printf '%s\n' "${SUDO_PASSWORD:-}" | sudo -S systemctl enable --now itops-agent-backend.service itops-agent-frontend.service
echo "backend_service=$(systemctl is-active itops-agent-backend.service 2>&1)"
echo "frontend_service=$(systemctl is-active itops-agent-frontend.service 2>&1)"

sleep 25
if curl -fsS --max-time 5 http://127.0.0.1:3001/health >/dev/null; then
  echo "backend_health=ok"
else
  echo "backend_health=failed"
fi

if curl -fsS --max-time 5 http://127.0.0.1:3002/ >/dev/null; then
  echo "frontend_health=ok"
else
  echo "frontend_health=failed"
fi

echo "ports:"
ss -lntp 2>/dev/null | grep -E ':(3001|3002)\b' || true
echo "runtime_log_tail:"
systemctl status --no-pager itops-agent-backend.service 2>&1 | tail -n 30 || true
systemctl status --no-pager itops-agent-frontend.service 2>&1 | tail -n 30 || true
echo "deployment_finished=$(date -Is)"

rm -f "${HOME}/.ght" "${HOME}/.sp" /tmp/i.tgz
