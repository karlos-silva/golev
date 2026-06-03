#!/usr/bin/env bash
# Preparação inicial do VPS (Ubuntu 22.04/24.04). Idempotente: pode rodar de novo.
# Uso (como root): bash vps-bootstrap.sh
set -euo pipefail

echo "==> Atualizando pacotes"
apt-get update -y

echo "==> Docker"
if ! command -v docker >/dev/null 2>&1; then
  curl -fsSL https://get.docker.com | sh
else
  echo "Docker já instalado: $(docker --version)"
fi
# plugin do compose vem junto no get.docker.com (docker compose v2)
docker compose version || { echo "compose plugin ausente"; exit 1; }

echo "==> Infisical CLI"
if ! command -v infisical >/dev/null 2>&1; then
  curl -1sLf 'https://artifacts-cli.infisical.com/setup.deb.sh' | bash
  apt-get update -y && apt-get install -y infisical
else
  echo "Infisical CLI já instalado: $(infisical --version 2>/dev/null | head -1)"
fi

echo "==> Firewall (ufw): libera 22, 80, 443"
if command -v ufw >/dev/null 2>&1; then
  ufw allow OpenSSH || ufw allow 22/tcp
  ufw allow 80/tcp
  ufw allow 443/tcp
  ufw --force enable
  ufw status verbose
else
  echo "ufw não disponível — configure o firewall pelo painel da Hostinger (22/80/443)"
fi

echo "==> Pasta do deploy"
mkdir -p /opt/golev/production/caddy/certs
echo "Criado: /opt/golev/production (e caddy/certs)"

echo "==> Pronto. Docker:"; docker --version
echo "Próximo passo: levar o código/infra e criar o .env."
