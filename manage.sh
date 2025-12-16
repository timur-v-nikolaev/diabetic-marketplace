#!/bin/bash

# Диабет-Маркет - управление проектом

if [ "$1" = "start" ]; then
    echo "🚀 Запуск приложения с Docker..."
    docker-compose up -d
    echo "✅ Приложение запущено!"
    echo "  Frontend: http://localhost:3000"
    echo "  Backend:  http://localhost:5000"
    
elif [ "$1" = "stop" ]; then
    echo "⏹️  Остановка приложения..."
    docker-compose down
    echo "✅ Приложение остановлено"
    
elif [ "$1" = "logs" ]; then
    echo "📋 Логи приложения:"
    docker-compose logs -f
    
elif [ "$1" = "rebuild" ]; then
    echo "🔨 Пересборка контейнеров..."
    docker-compose build
    echo "✅ Контейнеры пересобраны"
    
elif [ "$1" = "clean" ]; then
    echo "🧹 Очистка Docker ресурсов..."
    docker-compose down -v
    echo "✅ Ресурсы очищены"
    
elif [ "$1" = "backend" ]; then
    echo "🔧 Запуск backend в режиме разработки..."
    cd backend
    npm install
    npm run dev
    
elif [ "$1" = "frontend" ]; then
    echo "🎨 Запуск frontend в режиме разработки..."
    cd frontend
    npm install
    npm run dev
    
elif [ "$1" = "help" ]; then
    echo "Доступные команды:"
    echo "  ./manage.sh start     - Запустить приложение с Docker"
    echo "  ./manage.sh stop      - Остановить приложение"
    echo "  ./manage.sh logs      - Показать логи"
    echo "  ./manage.sh rebuild   - Пересобрать контейнеры"
    echo "  ./manage.sh clean     - Очистить все ресурсы"
    echo "  ./manage.sh backend   - Запустить backend локально"
    echo "  ./manage.sh frontend  - Запустить frontend локально"
    
else
    echo "❌ Неизвестная команда: $1"
    echo "Используйте: ./manage.sh help"
fi
