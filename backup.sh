#!/bin/bash

# 🔄 Скрипт автоматического бэкапа MongoDB
# Добавьте в crontab: 0 3 * * * /var/www/diabetic-marketplace/backup.sh

set -e

BACKUP_DIR="/var/www/backups"
DATE=$(date +%Y%m%d_%H%M%S)
CONTAINER_NAME="diabetic-marketplace-mongo-prod"
DB_NAME="diabetic-marketplace"

# Загрузка переменных окружения
cd /var/www/diabetic-marketplace
set -a
source .env.production
set +a

echo "================================================"
echo "🔄 Starting MongoDB backup: $DATE"
echo "================================================"

# Создание директории для бэкапов
mkdir -p $BACKUP_DIR

# Создание бэкапа внутри контейнера
echo "📦 Creating backup..."
docker exec $CONTAINER_NAME mongodump \
  --uri="mongodb://${MONGO_USER}:${MONGO_PASSWORD}@localhost:27017/${DB_NAME}?authSource=admin" \
  --out=/backup

# Копирование на хост
echo "📥 Copying backup to host..."
docker cp $CONTAINER_NAME:/backup $BACKUP_DIR/backup-$DATE

# Архивирование
echo "🗜️  Compressing backup..."
tar -czf $BACKUP_DIR/backup-$DATE.tar.gz -C $BACKUP_DIR backup-$DATE

# Удаление временной папки
rm -rf $BACKUP_DIR/backup-$DATE

# Размер архива
SIZE=$(du -h $BACKUP_DIR/backup-$DATE.tar.gz | cut -f1)
echo "📊 Backup size: $SIZE"

# Удаление старых бэкапов (старше 7 дней)
echo "🗑️  Removing backups older than 7 days..."
find $BACKUP_DIR -name "backup-*.tar.gz" -mtime +7 -delete

# Количество бэкапов
COUNT=$(ls -1 $BACKUP_DIR/backup-*.tar.gz 2>/dev/null | wc -l)
echo "📂 Total backups: $COUNT"

echo "================================================"
echo "✅ Backup completed: backup-$DATE.tar.gz"
echo "================================================"

# Очистка старого бэкапа из контейнера
docker exec $CONTAINER_NAME rm -rf /backup

# Логирование
echo "[$(date)] Backup completed: $SIZE, Total backups: $COUNT" >> /var/log/mongodb-backup.log
