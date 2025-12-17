# 🚀 Деплой на REG.RU

## 📋 Предварительные требования

1. **Зарегистрированный домен на REG.RU**
2. **VPS/VDS сервер** (минимум 2GB RAM, 2 CPU)
3. **SSH доступ к серверу**
4. **Установленный Docker и Docker Compose** на сервере

---

## 🔧 Подготовка сервера

### 1. Подключитесь к серверу

```bash
ssh root@ваш-ip-адрес
```

### 2. Установите Docker

```bash
# Обновите систему
apt update && apt upgrade -y

# Установите Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Установите Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Проверьте установку
docker --version
docker-compose --version
```

### 3. Установите Git

```bash
apt install git -y
```

---

## 📦 Деплой приложения

### 1. Клонируйте репозиторий

```bash
cd /var/www
git clone https://github.com/ваш-username/diabetic-marketplace.git
cd diabetic-marketplace
```

### 2. Настройте переменные окружения

```bash
# Создайте файл .env.production
cp .env.production.example .env.production

# Отредактируйте файл
nano .env.production
```

**Важно! Замените значения:**

```env
# MongoDB Configuration
MONGO_USER=admin
MONGO_PASSWORD=ваш-безопасный-пароль-123

# JWT Secret (32+ символов)
JWT_SECRET=your-super-secret-jwt-key-min-32-chars-random

# API URL (ваш домен)
NEXT_PUBLIC_API_URL=https://ваш-домен.ru/api

# Domain
DOMAIN=ваш-домен.ru
```

**Генерация JWT_SECRET:**
```bash
openssl rand -base64 32
```

### 3. Обновите nginx.conf

```bash
nano nginx/nginx.conf
```

Замените `ваш-домен.ru` на ваш реальный домен во всех местах.

### 4. Запустите приложение

```bash
# Загрузите переменные окружения
source .env.production

# Соберите и запустите контейнеры
docker-compose -f docker-compose.prod.yml up -d --build

# Проверьте статус
docker-compose -f docker-compose.prod.yml ps
```

### 5. Проверьте логи

```bash
# Backend
docker logs diabetic-marketplace-backend-prod -f

# Frontend
docker logs diabetic-marketplace-frontend-prod -f

# Nginx
docker logs diabetic-marketplace-nginx -f
```

---

## 🌐 Настройка домена на REG.RU

### 1. Настройте DNS записи

В панели управления REG.RU:

1. Перейдите в **"Управление DNS"**
2. Добавьте **A-записи**:

```
Тип: A
Субдомен: @
IP-адрес: ваш-ip-сервера
TTL: 3600

Тип: A
Субдомен: www
IP-адрес: ваш-ip-сервера
TTL: 3600
```

3. Сохраните изменения (распространение займет 1-24 часа)

---

## 🔒 Настройка SSL (HTTPS)

### Вариант 1: Let's Encrypt (Бесплатно)

```bash
# Установите Certbot
apt install certbot python3-certbot-nginx -y

# Получите сертификат
certbot --nginx -d ваш-домен.ru -d www.ваш-домен.ru

# Автоматическое обновление
certbot renew --dry-run
```

### Вариант 2: Сертификат от REG.RU

1. Купите SSL сертификат в панели REG.RU
2. Скачайте файлы сертификата
3. Загрузите на сервер:

```bash
mkdir -p nginx/ssl
# Загрузите certificate.crt и private.key в nginx/ssl/
```

4. Раскомментируйте SSL строки в `nginx/nginx.conf`
5. Перезапустите nginx:

```bash
docker-compose -f docker-compose.prod.yml restart nginx
```

---

## 📊 Создание первого администратора

```bash
# Подключитесь к контейнеру backend
docker exec -it diabetic-marketplace-backend-prod sh

# Создайте админа
npm run make-admin -- admin@yourdomain.ru
```

---

## 🔄 Обновление приложения

```bash
cd /var/www/diabetic-marketplace

# Остановите контейнеры
docker-compose -f docker-compose.prod.yml down

# Обновите код
git pull origin main

# Пересоберите и запустите
docker-compose -f docker-compose.prod.yml up -d --build
```

---

## 🛠️ Полезные команды

### Просмотр логов
```bash
docker-compose -f docker-compose.prod.yml logs -f
```

### Перезапуск сервисов
```bash
docker-compose -f docker-compose.prod.yml restart
```

### Остановка всех сервисов
```bash
docker-compose -f docker-compose.prod.yml down
```

### Очистка
```bash
# Удалить неиспользуемые образы
docker system prune -a

# Удалить volumes (ОСТОРОЖНО! Удалит БД)
docker-compose -f docker-compose.prod.yml down -v
```

### Бэкап MongoDB
```bash
# Создать бэкап
docker exec diabetic-marketplace-mongo-prod mongodump --uri="mongodb://admin:пароль@localhost:27017/diabetic-marketplace?authSource=admin" --out=/backup

# Восстановить из бэкапа
docker exec diabetic-marketplace-mongo-prod mongorestore --uri="mongodb://admin:пароль@localhost:27017/diabetic-marketplace?authSource=admin" /backup/diabetic-marketplace
```

---

## 🔍 Диагностика проблем

### Проверка портов
```bash
netstat -tulpn | grep LISTEN
```

### Проверка firewall
```bash
ufw status
ufw allow 80/tcp
ufw allow 443/tcp
```

### Проверка Docker сети
```bash
docker network inspect diabetic-marketplace_diabetic-network
```

---

## 📞 После деплоя

1. ✅ Откройте `https://ваш-домен.ru` в браузере
2. ✅ Создайте первого пользователя
3. ✅ Сделайте его администратором
4. ✅ Протестируйте все функции
5. ✅ Настройте регулярные бэкапы

---

## 🎯 Чеклист готовности

- [ ] Домен настроен и работает
- [ ] SSL сертификат установлен
- [ ] MongoDB работает и защищена паролем
- [ ] Backend возвращает данные
- [ ] Frontend отображается корректно
- [ ] Загрузка файлов работает
- [ ] Создан администратор
- [ ] Настроены регулярные бэкапы

---

## 🆘 Поддержка

Если возникли проблемы:
1. Проверьте логи контейнеров
2. Убедитесь что все порты открыты
3. Проверьте переменные окружения
4. Убедитесь что DNS записи распространились

**Готово! Ваш сайт теперь доступен по адресу https://ваш-домен.ru** 🚀
