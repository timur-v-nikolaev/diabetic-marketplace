#!/bin/bash

# 📊 Скрипт мониторинга состояния приложения
# Использование: ./monitor.sh

echo "================================================"
echo "📊 Application Status Monitor"
echo "================================================"
echo ""

cd /var/www/diabetic-marketplace

# Проверка Docker
echo "🐳 Docker Status:"
docker --version
echo ""

# Статус контейнеров
echo "📦 Container Status:"
docker-compose -f docker-compose.prod.yml ps
echo ""

# Использование ресурсов
echo "💻 Resource Usage:"
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}"
echo ""

# Проверка дискового пространства
echo "💾 Disk Usage:"
df -h / | tail -1
echo ""

# Использование памяти
echo "🧠 Memory Usage:"
free -h | grep Mem
echo ""

# Health check
echo "🏥 Health Checks:"
BACKEND_HEALTH=$(curl -s http://localhost:5001/api/health || echo "FAILED")
if [[ $BACKEND_HEALTH == *"ok"* ]]; then
    echo "✅ Backend: OK"
else
    echo "❌ Backend: FAILED"
fi

FRONTEND_CHECK=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 || echo "000")
if [[ $FRONTEND_CHECK == "200" ]]; then
    echo "✅ Frontend: OK"
else
    echo "❌ Frontend: FAILED (HTTP $FRONTEND_CHECK)"
fi

MONGO_CHECK=$(docker exec diabetic-marketplace-mongo-prod mongosh --quiet --eval "db.adminCommand('ping')" 2>/dev/null || echo "FAILED")
if [[ $MONGO_CHECK == *"ok"* ]]; then
    echo "✅ MongoDB: OK"
else
    echo "❌ MongoDB: FAILED"
fi

echo ""

# Количество записей в БД
echo "📊 Database Statistics:"
set -a
source .env.production
set +a

LISTINGS_COUNT=$(docker exec diabetic-marketplace-mongo-prod mongosh \
  "mongodb://${MONGO_USER}:${MONGO_PASSWORD}@localhost:27017/diabetic-marketplace?authSource=admin" \
  --quiet --eval "db.listings.countDocuments()" 2>/dev/null || echo "N/A")
  
USERS_COUNT=$(docker exec diabetic-marketplace-mongo-prod mongosh \
  "mongodb://${MONGO_USER}:${MONGO_PASSWORD}@localhost:27017/diabetic-marketplace?authSource=admin" \
  --quiet --eval "db.users.countDocuments()" 2>/dev/null || echo "N/A")

echo "   Listings: $LISTINGS_COUNT"
echo "   Users: $USERS_COUNT"
echo ""

# Последние логи с ошибками
echo "⚠️  Recent Errors (last 5):"
docker-compose -f docker-compose.prod.yml logs --tail=100 2>&1 | grep -i "error" | tail -5 || echo "   No errors found"
echo ""

# Время работы контейнеров
echo "⏱️  Uptime:"
docker ps --format "table {{.Names}}\t{{.Status}}" | grep diabetic
echo ""

echo "================================================"
echo "✅ Monitoring completed"
echo "================================================"
