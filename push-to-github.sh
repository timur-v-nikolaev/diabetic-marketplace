#!/bin/bash

echo "📤 Введите URL вашего GitHub репозитория:"
echo "Пример: https://github.com/username/diabetic-marketplace.git"
read -p "URL: " REPO_URL

cd /Users/timur.v.nikolaev/VS\ Code/diabetic-marketplace

# Добавляем remote
git remote add origin $REPO_URL

# Отправляем код
git push -u origin main

echo "✅ Код загружен на GitHub!"
echo "🔗 Репозиторий: $REPO_URL"
