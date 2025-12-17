# 🚀 Полный гайд: Деплой на REG.RU VPS с Docker

## 📋 Что понадобится:
- VPS/VDS на REG.RU (минимум 2GB RAM, 2 CPU, 20GB диск)
- Домен на REG.RU
- SSH доступ к серверу
- 30-60 минут времени

---

# ЧАСТЬ 1: Подготовка VPS сервера

## Шаг 1.1: Заказ VPS на REG.RU

1. Зайдите на https://www.reg.ru/vps/
2. Выберите тариф:
   - **Минимальный для теста:** VPS-1 (2GB RAM, 1 CPU) - ~500₽/мес
   - **Рекомендуемый:** VPS-2 (4GB RAM, 2 CPU) - ~1000₽/мес
3. ОС: **Ubuntu 22.04 LTS** (важно!)
4. После оплаты получите письмо с:
   - IP адресом сервера
   - Пароль root

## Шаг 1.2: Первое подключение к серверу

```bash
# На вашем Mac откройте Terminal
ssh root@ВАШ_IP_АДРЕС

# Введите пароль из письма
# При первом подключении подтвердите: yes
```

## Шаг 1.3: Базовая настройка безопасности

```bash
# Обновите систему
apt update && apt upgrade -y

# Создайте нового пользователя (безопаснее чем root)
adduser deployer
# Придумайте пароль, остальное можно пропустить (Enter)

# Дайте sudo права
usermod -aG sudo deployer

# Переключитесь на нового пользователя
su - deployer

# Проверка
whoami  # должно показать: deployer
```

## Шаг 1.4: Установка Docker

```bash
# Установите зависимости
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common

# Добавьте GPG ключ Docker
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Добавьте репозиторий Docker
echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Установите Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io

# Проверка установки
docker --version
# Должно показать: Docker version 24.x.x

# Добавьте пользователя в группу docker
sudo usermod -aG docker deployer

# Перелогиньтесь для применения
exit  # выход из deployer
exit  # выход с сервера

# Подключитесь снова
ssh deployer@ВАШ_IP_АДРЕС
```

## Шаг 1.5: Установка Docker Compose

```bash
# Скачайте последнюю версию
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# Дайте права на выполнение
sudo chmod +x /usr/local/bin/docker-compose

# Проверка
docker-compose --version
# Должно показать: Docker Compose version v2.x.x
```

## Шаг 1.6: Установка Git

```bash
sudo apt install -y git

# Настройте Git
git config --global user.name "Ваше Имя"
git config --global user.email "ваш@email.com"
```

## Шаг 1.7: Настройка Firewall

```bash
# Включите UFW
sudo ufw enable

# Разрешите SSH
sudo ufw allow 22/tcp

# Разрешите HTTP и HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Проверьте статус
sudo ufw status

# Должно показать:
# To                         Action      From
# --                         ------      ----
# 22/tcp                     ALLOW       Anywhere
# 80/tcp                     ALLOW       Anywhere
# 443/tcp                    ALLOW       Anywhere
```

---

# ЧАСТЬ 2: Деплой приложения

## Шаг 2.1: Создание директории для проекта

```bash
# Создайте директорию
sudo mkdir -p /var/www
sudo chown deployer:deployer /var/www
cd /var/www
```

## Шаг 2.2: Загрузка кода на сервер

### Вариант А: Через Git (рекомендуется)

Сначала на вашем Mac:
```bash
cd /Users/timur.v.nikolaev/VS\ Code/diabetic-marketplace

# Инициализируйте git (если еще не сделано)
git init
git add .
git commit -m "Initial commit"

# Создайте репозиторий на GitHub и загрузите
# gh repo create diabetic-marketplace --public --source=. --push
# Или через интерфейс GitHub
```

На сервере:
```bash
cd /var/www
git clone https://github.com/ваш-username/diabetic-marketplace.git
cd diabetic-marketplace
```

### Вариант Б: Через SCP (если нет Git)

На вашем Mac:
```bash
cd /Users/timur.v.nikolaev/VS\ Code

# Архивируйте проект
tar -czf diabetic-marketplace.tar.gz diabetic-marketplace/

# Загрузите на сервер
scp diabetic-marketplace.tar.gz deployer@ВАШ_IP:/var/www/

# На сервере распакуйте
ssh deployer@ВАШ_IP
cd /var/www
tar -xzf diabetic-marketplace.tar.gz
cd diabetic-marketplace
```

## Шаг 2.3: Настройка переменных окружения

```bash
cd /var/www/diabetic-marketplace

# Создайте файл .env.production из примера
cp .env.production.example .env.production

# Откройте редактор
nano .env.production
```

### Заполните переменные:

```env
# MongoDB Configuration
MONGO_USER=admin
MONGO_PASSWORD=super-secure-password-12345

# JWT Secret (ВАЖНО: Используйте уникальный)
JWT_SECRET=ваш-супер-длинный-секретный-ключ-минимум-32-символа

# API URL (замените на ваш домен)
NEXT_PUBLIC_API_URL=https://ваш-домен.ru/api

# Domain
DOMAIN=ваш-домен.ru
```

**Генерация безопасного JWT_SECRET:**
```bash
# На сервере выполните:
openssl rand -base64 48
# Скопируйте результат в JWT_SECRET
```

**Сохраните файл:** `Ctrl+O`, `Enter`, `Ctrl+X`

## Шаг 2.4: Обновление nginx конфигурации

```bash
# Откройте конфиг nginx
nano nginx/nginx.conf

# Найдите и замените все вхождения "ваш-домен.ru" на реальный домен
# Например: diabetic-shop.ru

# Сохраните: Ctrl+O, Enter, Ctrl+X
```

## Шаг 2.5: Создание директории для SSL (на будущее)

```bash
mkdir -p nginx/ssl
chmod 700 nginx/ssl
```

## Шаг 2.6: Сборка и запуск контейнеров

```bash
cd /var/www/diabetic-marketplace

# Загрузите переменные окружения
set -a
source .env.production
set +a

# Соберите образы (это займет 5-10 минут)
docker-compose -f docker-compose.prod.yml build

# Запустите контейнеры
docker-compose -f docker-compose.prod.yml up -d

# Проверьте статус
docker-compose -f docker-compose.prod.yml ps
```

**Должно показать:**
```
NAME                                  STATUS    PORTS
diabetic-marketplace-backend-prod     Up        0.0.0.0:5001->5000/tcp
diabetic-marketplace-frontend-prod    Up        0.0.0.0:3000->3000/tcp
diabetic-marketplace-mongo-prod       Up        0.0.0.0:27017->27017/tcp
diabetic-marketplace-nginx            Up        0.0.0.0:80->80/tcp, 0.0.0.0:443->443/tcp
```

## Шаг 2.7: Проверка логов

```bash
# Все логи
docker-compose -f docker-compose.prod.yml logs

# Только backend
docker logs diabetic-marketplace-backend-prod -f

# Только frontend
docker logs diabetic-marketplace-frontend-prod -f

# Ctrl+C для выхода
```

## Шаг 2.8: Проверка работы API

```bash
# Проверьте backend
curl http://localhost:5001/api/health

# Должно вернуть: {"status":"ok","timestamp":"..."}

# Проверьте через публичный IP
curl http://ВАШ_IP/api/health
```

---

# ЧАСТЬ 3: Настройка домена

## Шаг 3.1: Настройка DNS на REG.RU

1. Зайдите в личный кабинет REG.RU
2. Выберите ваш домен → **Управление DNS**
3. **Удалите все существующие A-записи** (если есть)
4. Добавьте новые записи:

### A-запись для основного домена:
```
Тип записи: A
Субдомен: @ (или оставьте пустым)
IP-адрес: ВАШ_IP_СЕРВЕРА
TTL: 3600
```

### A-запись для www:
```
Тип записи: A
Субдомен: www
IP-адрес: ВАШ_IP_СЕРВЕРА
TTL: 3600
```

5. Сохраните изменения
6. **Подождите 10-60 минут** для распространения DNS

## Шаг 3.2: Проверка DNS

На вашем Mac:
```bash
# Проверьте A-запись
nslookup ваш-домен.ru

# Должно показать ваш IP:
# Name:   ваш-домен.ru
# Address: ВАШ_IP

# Проверьте www
nslookup www.ваш-домен.ru
```

Если не работает, подождите еще. DNS может распространяться до 24 часов.

## Шаг 3.3: Проверка через браузер

```bash
# Откройте в браузере
http://ваш-домен.ru
http://www.ваш-домен.ru

# Должен открыться ваш сайт (без SSL пока)
```

---

# ЧАСТЬ 4: Установка SSL сертификата

## Шаг 4.1: Установка Certbot

```bash
# На сервере
sudo apt install -y certbot

# Остановите nginx контейнер
docker stop diabetic-marketplace-nginx
```

## Шаг 4.2: Получение сертификата

```bash
# Получите сертификат
sudo certbot certonly --standalone -d ваш-домен.ru -d www.ваш-домен.ru

# Следуйте инструкциям:
# 1. Введите email
# 2. Согласитесь с условиями: Y
# 3. Подписка на новости: N (необязательно)

# Сертификаты будут в:
# /etc/letsencrypt/live/ваш-домен.ru/fullchain.pem
# /etc/letsencrypt/live/ваш-домен.ru/privkey.pem
```

## Шаг 4.3: Копирование сертификатов

```bash
# Скопируйте сертификаты в проект
sudo cp /etc/letsencrypt/live/ваш-домен.ru/fullchain.pem /var/www/diabetic-marketplace/nginx/ssl/certificate.crt
sudo cp /etc/letsencrypt/live/ваш-домен.ru/privkey.pem /var/www/diabetic-marketplace/nginx/ssl/private.key

# Дайте права
sudo chown deployer:deployer /var/www/diabetic-marketplace/nginx/ssl/*
```

## Шаг 4.4: Включение SSL в nginx

```bash
cd /var/www/diabetic-marketplace

# Откройте конфиг
nano nginx/nginx.conf
```

**Раскомментируйте строки SSL:**

Найдите и раскомментируйте (уберите #):
```nginx
# Раскомментируйте этот блок:
server {
    listen 80;
    server_name ваш-домен.ru www.ваш-домен.ru;
    return 301 https://$server_name$request_uri;
}

# И эти строки:
listen 443 ssl http2;
ssl_certificate /etc/nginx/ssl/certificate.crt;
ssl_certificate_key /etc/nginx/ssl/private.key;
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers HIGH:!aNULL:!MD5;
```

Сохраните: `Ctrl+O`, `Enter`, `Ctrl+X`

## Шаг 4.5: Перезапуск nginx

```bash
# Перезапустите nginx
docker-compose -f docker-compose.prod.yml restart nginx

# Проверьте логи
docker logs diabetic-marketplace-nginx -f
```

## Шаг 4.6: Проверка SSL

Откройте в браузере:
```
https://ваш-домен.ru
```

Должен быть зеленый замочек 🔒

## Шаг 4.7: Автоматическое обновление сертификата

```bash
# Добавьте cron задачу для автообновления
sudo crontab -e

# Добавьте строку:
0 0 1 * * certbot renew --quiet && docker-compose -f /var/www/diabetic-marketplace/docker-compose.prod.yml restart nginx
```

---

# ЧАСТЬ 5: Миграция данных

## Шаг 5.1: Экспорт данных с локальной машины

На вашем Mac:
```bash
cd /Users/timur.v.nikolaev/VS\ Code/diabetic-marketplace

# Убедитесь что локальная MongoDB запущена
docker-compose up -d mongodb

# Экспорт данных
docker exec diabetic-marketplace-mongo mongodump \
  --uri="mongodb://admin:password@localhost:27017/diabetic-marketplace?authSource=admin" \
  --out=/backup

# Скопируйте на хост
docker cp diabetic-marketplace-mongo:/backup ./mongodb-backup

# Создайте архив
tar -czf mongodb-backup.tar.gz mongodb-backup/
```

## Шаг 5.2: Загрузка на сервер

```bash
# На Mac загрузите на сервер
scp mongodb-backup.tar.gz deployer@ВАШ_IP:/var/www/diabetic-marketplace/
```

## Шаг 5.3: Импорт данных

На сервере:
```bash
cd /var/www/diabetic-marketplace

# Распакуйте архив
tar -xzf mongodb-backup.tar.gz

# Импорт в MongoDB контейнер
docker exec -i diabetic-marketplace-mongo-prod mongorestore \
  --uri="mongodb://admin:super-secure-password-12345@localhost:27017/diabetic-marketplace?authSource=admin" \
  --drop \
  /data/backup/diabetic-marketplace

# Проверьте данные
docker exec -it diabetic-marketplace-mongo-prod mongosh \
  "mongodb://admin:super-secure-password-12345@localhost:27017/diabetic-marketplace?authSource=admin"

# В mongosh:
db.listings.countDocuments()  # Должно показать количество объявлений
exit
```

---

# ЧАСТЬ 6: Настройка автоматического деплоя (опционально)

## Шаг 6.1: Создание скрипта обновления

```bash
cd /var/www/diabetic-marketplace

# Создайте скрипт
nano deploy.sh
```

Вставьте:
```bash
#!/bin/bash

echo "🚀 Starting deployment..."

cd /var/www/diabetic-marketplace

# Pull latest code
echo "📦 Pulling latest code..."
git pull origin main

# Load environment
set -a
source .env.production
set +a

# Stop containers
echo "🛑 Stopping containers..."
docker-compose -f docker-compose.prod.yml down

# Rebuild images
echo "🔨 Building images..."
docker-compose -f docker-compose.prod.yml build --no-cache

# Start containers
echo "🚀 Starting containers..."
docker-compose -f docker-compose.prod.yml up -d

# Show logs
echo "📊 Checking status..."
docker-compose -f docker-compose.prod.yml ps

echo "✅ Deployment complete!"
```

Сохраните и дайте права:
```bash
chmod +x deploy.sh
```

## Шаг 6.2: Использование скрипта

```bash
# Для обновления сайта просто выполните:
./deploy.sh
```

---

# ЧАСТЬ 7: Мониторинг и обслуживание

## Полезные команды

### Просмотр статуса
```bash
docker-compose -f docker-compose.prod.yml ps
```

### Просмотр логов
```bash
# Все логи
docker-compose -f docker-compose.prod.yml logs -f

# Только backend
docker logs diabetic-marketplace-backend-prod -f --tail 100

# Только frontend
docker logs diabetic-marketplace-frontend-prod -f --tail 100
```

### Перезапуск сервисов
```bash
# Все сервисы
docker-compose -f docker-compose.prod.yml restart

# Только backend
docker-compose -f docker-compose.prod.yml restart backend

# Только frontend
docker-compose -f docker-compose.prod.yml restart frontend
```

### Проверка использования ресурсов
```bash
# Использование контейнерами
docker stats

# Использование диска
df -h

# Использование RAM
free -h
```

### Очистка
```bash
# Удалить неиспользуемые образы
docker system prune -a

# Удалить логи Docker
sudo sh -c "truncate -s 0 /var/lib/docker/containers/*/*-json.log"
```

## Бэкап базы данных

### Ручной бэкап
```bash
# Создать бэкап
docker exec diabetic-marketplace-mongo-prod mongodump \
  --uri="mongodb://admin:ПАРОЛЬ@localhost:27017/diabetic-marketplace?authSource=admin" \
  --out=/backup

# Скопировать на хост
docker cp diabetic-marketplace-mongo-prod:/backup ./backup-$(date +%Y%m%d)

# Архивировать
tar -czf backup-$(date +%Y%m%d).tar.gz backup-$(date +%Y%m%d)/
```

### Автоматический бэкап
```bash
# Создайте скрипт
nano /var/www/backup-mongodb.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/var/www/backups"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

docker exec diabetic-marketplace-mongo-prod mongodump \
  --uri="mongodb://admin:ПАРОЛЬ@localhost:27017/diabetic-marketplace?authSource=admin" \
  --out=/backup

docker cp diabetic-marketplace-mongo-prod:/backup $BACKUP_DIR/backup-$DATE

tar -czf $BACKUP_DIR/backup-$DATE.tar.gz -C $BACKUP_DIR backup-$DATE
rm -rf $BACKUP_DIR/backup-$DATE

# Удалить бэкапы старше 7 дней
find $BACKUP_DIR -name "backup-*.tar.gz" -mtime +7 -delete

echo "Backup completed: backup-$DATE.tar.gz"
```

Дайте права и добавьте в cron:
```bash
chmod +x /var/www/backup-mongodb.sh

# Добавьте в crontab (каждый день в 3:00)
crontab -e
0 3 * * * /var/www/backup-mongodb.sh >> /var/log/mongodb-backup.log 2>&1
```

---

# ЧАСТЬ 8: Диагностика проблем

## Проблема 1: Сайт не открывается

```bash
# Проверьте статус контейнеров
docker-compose -f docker-compose.prod.yml ps

# Проверьте логи nginx
docker logs diabetic-marketplace-nginx --tail 50

# Проверьте порты
sudo netstat -tulpn | grep LISTEN

# Проверьте firewall
sudo ufw status
```

## Проблема 2: Backend не отвечает

```bash
# Логи backend
docker logs diabetic-marketplace-backend-prod --tail 100

# Проверьте подключение к MongoDB
docker exec -it diabetic-marketplace-backend-prod sh
curl http://localhost:5000/api/health
exit

# Перезапустите backend
docker-compose -f docker-compose.prod.yml restart backend
```

## Проблема 3: MongoDB не подключается

```bash
# Проверьте статус MongoDB
docker logs diabetic-marketplace-mongo-prod

# Попробуйте подключиться вручную
docker exec -it diabetic-marketplace-mongo-prod mongosh \
  "mongodb://admin:ПАРОЛЬ@localhost:27017/diabetic-marketplace?authSource=admin"

# Проверьте пароль в .env.production
cat .env.production | grep MONGO_PASSWORD
```

## Проблема 4: SSL не работает

```bash
# Проверьте сертификаты
ls -la nginx/ssl/

# Проверьте конфиг nginx
docker exec diabetic-marketplace-nginx nginx -t

# Перезапустите nginx
docker-compose -f docker-compose.prod.yml restart nginx

# Обновите сертификат
sudo certbot renew --force-renewal
```

---

# 🎯 Чеклист готовности

После выполнения всех шагов проверьте:

- [ ] ✅ VPS настроен и защищен
- [ ] ✅ Docker и Docker Compose установлены
- [ ] ✅ Код загружен на сервер
- [ ] ✅ Переменные окружения настроены
- [ ] ✅ Все контейнеры запущены (5 шт)
- [ ] ✅ DNS записи настроены
- [ ] ✅ Домен работает (http://ваш-домен.ru)
- [ ] ✅ SSL сертификат установлен (https://ваш-домен.ru)
- [ ] ✅ Зеленый замочек в браузере 🔒
- [ ] ✅ API отвечает (https://ваш-домен.ru/api/health)
- [ ] ✅ Данные импортированы в MongoDB
- [ ] ✅ Регистрация пользователя работает
- [ ] ✅ Загрузка фото работает
- [ ] ✅ Настроены автоматические бэкапы

---

# 📞 Следующие шаги

1. **Создайте администратора:**
```bash
docker exec -it diabetic-marketplace-backend-prod npm run make-admin -- admin@yourdomain.ru
```

2. **Протестируйте все функции:**
   - Регистрация
   - Вход
   - Создание объявления
   - Загрузка фото
   - Поиск
   - Редактирование профиля

3. **Настройте мониторинг** (опционально):
   - UptimeRobot для проверки доступности
   - Google Analytics для статистики

4. **Оптимизируйте** (по мере роста):
   - Настройте CDN (Cloudflare)
   - Увеличьте ресурсы VPS
   - Добавьте Redis для кэширования

---

# 🎉 Готово!

Ваш сайт теперь работает на:
**https://ваш-домен.ru**

Поздравляю! 🚀
