#!/bin/bash

# 🚀 Автоматический скрипт деплоя на production
# Использование: ./deploy.sh

set -e  # Остановить при ошибке

echo "================================================"
echo "🚀 Starting deployment to production..."
echo "================================================"

# Переход в директорию проекта
cd /var/www/diabetic-marketplace

# Проверка git репозитория
if [ -d .git ]; then
    echo "📦 Pulling latest code from git..."
    git pull origin main || echo "⚠️  Git pull failed, continuing anyway..."
else
    echo "ℹ️  Not a git repository, skipping git pull"
fi

# Загрузка переменных окружения
echo "🔐 Loading environment variables..."
set -a
source .env.production
set +a

# Остановка контейнеров
echo "🛑 Stopping containers..."
docker-compose -f docker-compose.prod.yml down

# Очистка старых образов (опционально)
read -p "🗑️  Remove old Docker images? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🗑️  Cleaning old images..."
    docker system prune -af --volumes
fi

# Сборка новых образов
echo "🔨 Building Docker images..."
docker-compose -f docker-compose.prod.yml build --no-cache

# Запуск контейнеров
echo "🚀 Starting containers..."
docker-compose -f docker-compose.prod.yml up -d

# Ожидание запуска
echo "⏳ Waiting for services to start..."
sleep 10

# Проверка статуса
echo "📊 Checking container status..."
docker-compose -f docker-compose.prod.yml ps

# Проверка здоровья backend
echo "🏥 Health check..."
HEALTH_CHECK=$(curl -s http://localhost:5001/api/health || echo "failed")
if [[ $HEALTH_CHECK == *"ok"* ]]; then
    echo "✅ Backend is healthy!"
else
    echo "❌ Backend health check failed!"
    echo "Check logs: docker logs diabetic-marketplace-backend-prod"
    exit 1
fi

# Показать последние логи
echo "📋 Recent logs:"
docker-compose -f docker-compose.prod.yml logs --tail=20

echo "================================================"
echo "✅ Deployment completed successfully!"
echo "================================================"
echo ""
echo "🌐 Your site is available at:"
echo "   https://$DOMAIN"
echo ""
echo "📊 Useful commands:"
echo "   docker-compose -f docker-compose.prod.yml ps     # Check status"
echo "   docker-compose -f docker-compose.prod.yml logs   # View logs"
echo "   docker-compose -f docker-compose.prod.yml restart # Restart services"
echo ""
