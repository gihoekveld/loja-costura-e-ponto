#!/bin/bash
# =========================================================================
# Costura & Ponto — Script de Geração Periódica de Usuários (Cron a cada 5m)
# =========================================================================

PORT="${PORT:-8080}"
KEY="${CRON_KEY:-senha123}"
URL="http://127.0.0.1:${PORT}/api/cron/generate-user?key=${KEY}"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Chamando rota incremental de criação de usuário..."
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" "$URL")
STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS" | cut -d':' -f2)
BODY=$(echo "$RESPONSE" | grep -v "HTTP_STATUS")

if [ "$STATUS" -eq 201 ]; then
    echo "✅ Usuário criado com sucesso!"
    echo "$BODY"
else
    echo "❌ Erro ao criar usuário (HTTP $STATUS):"
    echo "$BODY"
fi
