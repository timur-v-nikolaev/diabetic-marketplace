# 🚀 Быстрый деплой: Vercel + Railway + MongoDB Atlas

## 📋 Что получится:
- ✅ Frontend на Vercel (бесплатно, с SSL)
- ✅ Backend на Railway (бесплатно, 500 часов/месяц)
- ✅ База данных на MongoDB Atlas (бесплатно, 512MB)
- ⏱️ Время: 15-20 минут

---

## 🗄️ ШАГ 1: MongoDB Atlas (База данных)

### 1.1 Создайте аккаунт
1. Откройте https://www.mongodb.com/cloud/atlas/register
2. Зарегистрируйтесь (можно через Google)

### 1.2 Создайте кластер
1. Выберите **FREE** план (M0 Sandbox)
2. Провайдер: **AWS**
3. Регион: **Frankfurt (eu-central-1)** или ближайший
4. Нажмите **Create Cluster**

### 1.3 Настройте доступ
1. **Database Access** → **Add New Database User**
   - Username: `admin`
   - Password: `сгенерируйте безопасный пароль`
   - Role: **Atlas admin**
   - Сохраните пароль!

2. **Network Access** → **Add IP Address**
   - Нажмите **Allow Access from Anywhere** (0.0.0.0/0)
   - Confirm

### 1.4 Получите строку подключения
1. **Database** → **Connect** → **Connect your application**
2. Driver: **Node.js**
3. Скопируйте строку подключения:
```
mongodb+srv://admin:<password>@cluster0.xxxxx.mongodb.net/diabetic-marketplace?retryWrites=true&w=majority
```
4. Замените `<password>` на ваш реальный пароль

**Сохраните эту строку! Она понадобится для Railway.**

---

## 🚂 ШАГ 2: Railway (Backend API)

### 2.1 Создайте аккаунт
1. Откройте https://railway.app
2. Войдите через GitHub

### 2.2 Создайте новый проект
1. Нажмите **New Project**
2. Выберите **Deploy from GitHub repo**
3. Выберите ваш репозиторий `diabetic-marketplace`
4. Root Directory: `/backend`

### 2.3 Настройте переменные окружения
В настройках проекта Railway → **Variables**:

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://admin:ВАШ_ПАРОЛЬ@cluster0.xxxxx.mongodb.net/diabetic-marketplace?retryWrites=true&w=majority
JWT_SECRET=ваш-супер-секретный-ключ-минимум-32-символа
```

**Генерация JWT_SECRET** (выполните локально):
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2.4 Настройте домен
1. В Railway проекте → **Settings** → **Domains**
2. **Generate Domain** → получите URL типа `your-app.up.railway.app`
3. **Скопируйте этот URL** - он понадобится для Vercel

### 2.5 Деплой
Railway автоматически задеплоит при коммите в GitHub.

**Проверка:**
```bash
curl https://your-app.up.railway.app/api/health
```

Должно вернуть: `{"status":"ok"}`

---

## ▲ ШАГ 3: Vercel (Frontend)

### 3.1 Установите Vercel CLI
```bash
npm install -g vercel
```

### 3.2 Залогиньтесь
```bash
vercel login
# Выберите способ входа (GitHub/Email)
```

### 3.3 Деплой фронтенда
```bash
cd /Users/timur.v.nikolaev/VS\ Code/diabetic-marketplace/frontend

# Первый деплой
vercel

# Следуйте инструкциям:
# Set up and deploy? → Yes
# Which scope? → Ваш аккаунт
# Link to existing project? → No
# Project name? → diabetic-marketplace
# In which directory is your code located? → ./
# Want to override settings? → Yes
# Build Command? → npm run build
# Output Directory? → .next
# Development Command? → npm run dev
```

### 3.4 Настройте переменную окружения
```bash
# Добавьте API URL (из Railway)
vercel env add NEXT_PUBLIC_API_URL

# Введите значение:
# Production: https://your-app.up.railway.app/api
```

### 3.5 Production деплой
```bash
vercel --prod
```

Vercel даст вам URL типа: `https://diabetic-marketplace.vercel.app`

---

## 🌐 ШАГ 4: Привязка домена REG.RU

### 4.1 В Vercel
1. Откройте проект в https://vercel.com/dashboard
2. **Settings** → **Domains**
3. **Add Domain** → введите `ваш-домен.ru`
4. Vercel покажет DNS записи для настройки

### 4.2 В REG.RU
1. Откройте панель управления доменом
2. **Управление DNS** → **Добавить запись**

Для домена без www:
```
Тип: A
Имя: @
Значение: 76.76.21.21 (IP от Vercel)
TTL: 3600
```

Для www:
```
Тип: CNAME
Имя: www
Значение: cname.vercel-dns.com
TTL: 3600
```

3. Сохраните изменения (распространение 10-60 минут)

### 4.3 SSL сертификат
Vercel автоматически выпустит SSL после настройки DNS (5-10 минут)

---

## 📊 ШАГ 5: Миграция данных

### 5.1 Экспорт локальных данных
```bash
# Запустите локальный MongoDB
docker-compose up -d mongodb

# Экспорт данных
docker exec diabetic-marketplace-mongo mongodump \
  --uri="mongodb://admin:password@localhost:27017/diabetic-marketplace?authSource=admin" \
  --out=/backup

# Скопируйте на хост
docker cp diabetic-marketplace-mongo:/backup ./mongodb-backup
```

### 5.2 Импорт в MongoDB Atlas
```bash
# Установите MongoDB Tools
brew install mongodb/brew/mongodb-database-tools

# Импорт
mongorestore \
  --uri="mongodb+srv://admin:ВАШ_ПАРОЛЬ@cluster0.xxxxx.mongodb.net" \
  --db=diabetic-marketplace \
  ./mongodb-backup/diabetic-marketplace
```

---

## ✅ ШАГ 6: Проверка

### 6.1 Проверьте Backend
```bash
curl https://your-app.up.railway.app/api/stats
```

### 6.2 Проверьте Frontend
Откройте `https://ваш-домен.ru` или `https://diabetic-marketplace.vercel.app`

### 6.3 Тест функционала
1. ✅ Регистрация пользователя
2. ✅ Вход в систему
3. ✅ Просмотр объявлений
4. ✅ Создание объявления
5. ✅ Загрузка фото

---

## 🔄 Автоматическое обновление

### Git Push → Auto Deploy

Теперь при каждом push в GitHub:
1. **Railway** автоматически обновит backend
2. **Vercel** автоматически обновит frontend

```bash
git add .
git commit -m "Update feature"
git push origin main

# Подождите 2-3 минуты
# Оба сервиса автоматически задеплоят изменения
```

---

## 💰 Стоимость

**FREE tier лимиты:**

| Сервис | План | Лимиты |
|--------|------|--------|
| MongoDB Atlas | M0 | 512MB, безлимит |
| Railway | Hobby | 500 часов/месяц, $5 кредита |
| Vercel | Hobby | 100GB трафика, безлимит проектов |

Для маркетплейса с 1000-5000 пользователей/месяц - **полностью бесплатно**.

---

## 🛠️ Полезные команды

### Vercel
```bash
# Просмотр логов
vercel logs

# Откатиться к предыдущей версии
vercel rollback

# Список деплоев
vercel ls
```

### Railway
```bash
# Установка Railway CLI
npm i -g @railway/cli

# Логи
railway logs

# Переменные окружения
railway variables
```

### Локальная разработка
```bash
# Backend локально → Railway MongoDB
MONGODB_URI="mongodb+srv://..." npm run dev

# Frontend локально → Railway Backend
NEXT_PUBLIC_API_URL="https://your-app.up.railway.app/api" npm run dev
```

---

## 🆘 Решение проблем

### Backend не отвечает
```bash
# Проверьте логи Railway
railway logs -f

# Проверьте переменные
railway variables
```

### Frontend не подключается к API
1. Проверьте `NEXT_PUBLIC_API_URL` в Vercel
2. Убедитесь что Railway backend запущен
3. Проверьте CORS в backend (должен разрешать Vercel домен)

### MongoDB подключение
```bash
# Тест подключения
mongosh "mongodb+srv://admin:ПАРОЛЬ@cluster0.xxxxx.mongodb.net"
```

---

## 🎯 Готово!

Ваш сайт теперь:
- ✅ Доступен 24/7
- ✅ Автоматически масштабируется
- ✅ Защищен SSL
- ✅ Имеет CDN (через Vercel)
- ✅ Автоматически деплоится при push

**URL:** https://ваш-домен.ru 🚀
