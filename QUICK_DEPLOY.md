# 🚀 Быстрый деплой за 15 минут

## ✅ ШАГ 1: GitHub (2 минуты)

1. Откройте: https://github.com/new
2. Repository name: `diabetic-marketplace`
3. ✅ Public
4. ❌ Без README/License
5. Create repository
6. **Скопируйте URL** (выглядит как: https://github.com/USERNAME/diabetic-marketplace.git)

Выполните:
```bash
cd /Users/timur.v.nikolaev/VS\ Code/diabetic-marketplace
git remote add origin ВАSH_URL
git push -u origin main
```

---

## ✅ ШАГ 2: MongoDB Atlas (5 минут)

1. Откройте: https://www.mongodb.com/cloud/atlas/register
2. Зарегистрируйтесь (через Google быстрее)
3. **Create Deployment** → **FREE (M0)**
4. Provider: AWS, Region: Frankfurt
5. **Create**

### Настройка доступа:

**Database Access:**
- Add Database User
- Username: `admin`
- Password: **Сгенерируйте** и сохраните!
- Role: Atlas admin
- Add User

**Network Access:**
- Add IP Address
- 0.0.0.0/0 (Allow from anywhere)
- Confirm

### Получите строку подключения:

1. **Connect** → **Drivers**
2. **Copy** connection string
3. Замените `<password>` на ваш пароль

**Пример:**
```
mongodb+srv://admin:ПАРОЛЬ@cluster0.abc123.mongodb.net/diabetic-marketplace?retryWrites=true&w=majority
```

**💾 СОХРАНИТЕ ЭТУ СТРОКУ!**

---

## ✅ ШАГ 3: Railway Backend (5 минут)

1. Откройте: https://railway.app
2. **Login with GitHub**
3. **New Project** → **Deploy from GitHub repo**
4. Выберите `diabetic-marketplace`
5. Railway начнет деплой (подождите 2-3 минуты)

### Настройте переменные:

**Variables** → **Add Variables:**

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://admin:ВАШ_ПАРОЛЬ@cluster0.xxxxx.mongodb.net/diabetic-marketplace?retryWrites=true&w=majority
JWT_SECRET=c10324300f54b76cc24e01f66ff41d305f511c9db33cc47e4280c9470f4da962
```

### Настройте домен:

1. **Settings** → **Networking** → **Generate Domain**
2. **💾 СКОПИРУЙТЕ URL** (например: `backend-production-a1b2.up.railway.app`)

### Проверка:

Откройте в браузере:
```
https://ваш-railway-домен/api/health
```

Должно показать: `{"status":"ok"}`

---

## ✅ ШАГ 4: Vercel Frontend (3 минуты)

### Вариант A: Через Vercel CLI (быстрее)

```bash
cd /Users/timur.v.nikolaev/VS\ Code/diabetic-marketplace/frontend

# Деплой
vercel

# Следуйте инструкциям:
# Set up and deploy? → Yes
# Which scope? → [Ваш аккаунт]
# Link to existing project? → No
# Project name? → diabetic-marketplace
# In which directory is your code? → ./
# Want to override the settings? → Yes
# Build Command? → npm run build
# Output Directory? → .next
# Development Command? → npm run dev

# После успешного деплоя добавьте переменную:
vercel env add NEXT_PUBLIC_API_URL production

# Введите значение:
https://ваш-railway-домен/api

# Production деплой:
vercel --prod
```

### Вариант B: Через Vercel Dashboard (проще)

1. Откройте: https://vercel.com/new
2. **Import Git Repository**
3. Выберите `diabetic-marketplace`
4. **Root Directory:** `frontend`
5. **Framework Preset:** Next.js
6. **Environment Variables:**
   - Name: `NEXT_PUBLIC_API_URL`
   - Value: `https://ваш-railway-домен/api`
7. **Deploy**

Vercel даст вам URL типа: `https://diabetic-marketplace.vercel.app`

**✅ ОТКРОЙТЕ В БРАУЗЕРЕ И ПРОВЕРЬТЕ!**

---

## ✅ ШАГ 5: Привязка домена REG.RU (опционально)

### В Vercel:

1. **Settings** → **Domains**
2. **Add Domain:** `ваш-домен.ru`
3. Vercel покажет DNS записи

### В REG.RU:

1. **Управление DNS**
2. Добавьте A-запись:
   - Тип: `A`
   - Субдомен: `@`
   - IP: (показан в Vercel)
3. Добавьте CNAME:
   - Тип: `CNAME`
   - Субдомен: `www`
   - Значение: `cname.vercel-dns.com`

Подождите 10-60 минут для распространения DNS.

---

## 🎉 ГОТОВО!

Ваш сайт работает на:
- 🌐 **Vercel:** https://diabetic-marketplace.vercel.app
- 🔗 **Railway:** https://ваш-railway-домен/api
- 🗄️ **MongoDB:** Atlas Cloud

### Проверьте:
- ✅ Главная страница открывается
- ✅ Регистрация работает
- ✅ Вход работает
- ✅ Объявления загружаются

---

## 📊 Миграция данных (если нужно)

```bash
# На Mac экспортируйте локальные данные
cd /Users/timur.v.nikolaev/VS\ Code/diabetic-marketplace
docker-compose up -d mongodb
docker exec diabetic-marketplace-mongo mongodump \
  --uri="mongodb://admin:password@localhost:27017/diabetic-marketplace?authSource=admin" \
  --out=/backup
docker cp diabetic-marketplace-mongo:/backup ./mongodb-backup

# Установите MongoDB tools
brew tap mongodb/brew
brew install mongodb-database-tools

# Импортируйте в Atlas
mongorestore \
  --uri="mongodb+srv://admin:ПАРОЛЬ@cluster0.xxxxx.mongodb.net" \
  --db=diabetic-marketplace \
  ./mongodb-backup/diabetic-marketplace
```

---

## 🔄 Автообновление

Теперь при каждом `git push`:
- Railway автоматически обновит backend
- Vercel автоматически обновит frontend

```bash
git add .
git commit -m "Update"
git push origin main
# Подождите 2-3 минуты
```

---

## 🆘 Проблемы?

**Backend не работает:**
- Проверьте логи в Railway Dashboard
- Убедитесь что все переменные окружения заданы
- Проверьте MongoDB URI

**Frontend не подключается к API:**
- Проверьте `NEXT_PUBLIC_API_URL` в Vercel
- Убедитесь что Railway backend запущен
- Откройте Network tab в браузере (F12)

**MongoDB не подключается:**
- Проверьте пароль в строке подключения
- Убедитесь что IP 0.0.0.0/0 разрешен в Atlas
