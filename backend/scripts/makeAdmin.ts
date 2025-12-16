import mongoose from 'mongoose';
import User from '../src/models/user.model';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://mongo:27017/diabetic-marketplace';

async function makeAdmin(email: string) {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Подключено к MongoDB');

    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      console.error(`❌ Пользователь с email ${email} не найден`);
      process.exit(1);
    }

    user.isAdmin = true;
    await user.save();

    console.log(`✅ Пользователь ${user.name} (${user.email}) теперь администратор`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Ошибка:', error);
    process.exit(1);
  }
}

const email = process.argv[2];
if (!email) {
  console.error('❌ Укажите email пользователя: npm run make-admin <email>');
  process.exit(1);
}

makeAdmin(email);
