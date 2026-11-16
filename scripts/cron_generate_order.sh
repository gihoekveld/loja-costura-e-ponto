#!/bin/bash
# =========================================================================
# Costura & Ponto — Script de Geração Periódica de Pedidos (Cron a cada 5m)
# =========================================================================

PORT="${PORT:-8080}"
KEY="${CRON_KEY:-senha123}"
URL="http://127.0.0.1:${PORT}/api/cron/generate-order?key=${KEY}"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Chamando rota incremental de criação de pedido..."
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" "$URL")
STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS" | cut -d':' -f2)
BODY=$(echo "$RESPONSE" | grep -v "HTTP_STATUS")

if [ "$STATUS" -eq 201 ]; then
    echo "✅ Pedido criado com sucesso!"
    echo "$BODY"
else
    echo "❌ Erro ao criar pedido (HTTP $STATUS):"
    echo "$BODY"
fi

