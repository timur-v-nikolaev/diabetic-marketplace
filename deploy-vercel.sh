#!/bin/bash

# 🚀 Автоматический деплой на Vercel

echo "================================================"
echo "🚀 Vercel Frontend Deployment"
echo "================================================"
echo ""

cd /Users/timur.v.nikolaev/VS\ Code/diabetic-marketplace/frontend

# Проверка Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI не установлен"
    echo "Установите: sudo npm install -g vercel"
    exit 1
fi

echo "📋 Введите URL вашего Railway backend:"
echo "Пример: https://backend-production-a1b2.up.railway.app"
read -p "Railway URL: " RAILWAY_URL

# Удаляем /api если пользователь добавил
RAILWAY_URL=${RAILWAY_URL%/api}

echo ""
echo "🔐 API URL: $RAILWAY_URL/api"
echo ""

# Первый деплой
echo "🚀 Начинаем деплой..."
echo ""
echo "Следуйте инструкциям Vercel CLI:"
echo "1. Set up and deploy? → Yes"
echo "2. Which scope? → [Выберите ваш аккаунт]"
echo "3. Link to existing project? → No"
echo "4. Project name? → diabetic-marketplace (или другое)"
echo "5. In which directory? → ./"
echo "6. Want to override? → Yes"
echo "7. Build Command? → npm run build"
echo "8. Output Directory? → .next"
echo "9. Development Command? → npm run dev"
echo ""
read -p "Нажмите Enter для продолжения..."

vercel

if [ $? -ne 0 ]; then
    echo "❌ Ошибка деплоя"
    exit 1
fi

echo ""
echo "✅ Preview деплой завершен!"
echo ""
echo "📝 Теперь добавим переменную окружения..."
echo ""

# Добавляем переменную окружения
echo "$RAILWAY_URL/api" | vercel env add NEXT_PUBLIC_API_URL production

echo ""
echo "🚀 Production деплой..."
vercel --prod

if [ $? -ne 0 ]; then
    echo "❌ Ошибка production деплоя"
    exit 1
fi

echo ""
echo "================================================"
echo "✅ Деплой завершен успешно!"
echo "================================================"
echo ""
echo "🌐 Ваш сайт доступен по URL из вывода выше"
echo ""
echo "📊 Полезные команды:"
echo "   vercel          - Повторный деплой"
echo "   vercel --prod   - Production деплой"
echo "   vercel logs     - Просмотр логов"
echo "   vercel ls       - Список деплоев"
echo ""
