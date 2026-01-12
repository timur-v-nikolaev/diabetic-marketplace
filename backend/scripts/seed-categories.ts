import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  icon: { type: String, required: true },
  description: { type: String, required: true },
}, { timestamps: true });

const Category = mongoose.model('Category', categorySchema);

const categories = [
  {
    name: 'Глюкометры',
    icon: '🩸',
    description: 'Глюкометры и системы мониторинга глюкозы',
  },
  {
    name: 'Тест-полоски',
    icon: '📏',
    description: 'Тест-полоски для глюкометров',
  },
  {
    name: 'Инсулин',
    icon: '💉',
    description: 'Инсулин разных типов',
  },
  {
    name: 'Шприц-ручки',
    icon: '✏️',
    description: 'Шприц-ручки для инсулина',
  },
  {
    name: 'Иглы',
    icon: '📍',
    description: 'Иглы для шприц-ручек',
  },
  {
    name: 'Инсулиновые помпы',
    icon: '⚙️',
    description: 'Инсулиновые помпы и расходные материалы',
  },
  {
    name: 'Сенсоры мониторинга',
    icon: '📡',
    description: 'Сенсоры непрерывного мониторинга глюкозы (CGM)',
  },
  {
    name: 'Ланцеты',
    icon: '🔸',
    description: 'Ланцеты для прокалывания пальца',
  },
  {
    name: 'Чехлы и аксессуары',
    icon: '👜',
    description: 'Чехлы для помп, сумки для инсулина',
  },
  {
    name: 'Диабетическое питание',
    icon: '🥗',
    description: 'Продукты питания для диабетиков',
  },
  {
    name: 'Книги и литература',
    icon: '📚',
    description: 'Книги и материалы о диабете',
  },
  {
    name: 'Другое',
    icon: '📦',
    description: 'Другие товары для диабетиков',
  },
];

async function seedCategories() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/diabetic-marketplace';
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    console.log('Seeding categories...');
    
    for (const category of categories) {
      await Category.findOneAndUpdate(
        { name: category.name },
        category,
        { upsert: true, new: true }
      );
      console.log(`✓ ${category.icon} ${category.name}`);
    }

    console.log('\n✅ Categories seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding categories:', error);
    process.exit(1);
  }
}

seedCategories();
