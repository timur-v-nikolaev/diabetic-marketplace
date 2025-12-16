import Head from 'next/head';

export default function PrivacyPolicy() {
  return (
    <>
      <Head>
        <title>Политика конфиденциальности | Diabetic Marketplace</title>
      </Head>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Политика конфиденциальности</h1>
        
        <div className="prose max-w-none space-y-6 text-gray-700">
          <section>
            <h2 className="text-2xl font-semibold mb-3 text-gray-900">1. Общие положения</h2>
            <p>
              Настоящая Политика конфиденциальности определяет порядок обработки и защиты 
              персональных данных пользователей платформы Diabetic Marketplace (далее — «Сервис»).
            </p>
            <p>
              Используя наш Сервис, вы соглашаетесь с условиями настоящей Политики конфиденциальности.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3 text-gray-900">2. Собираемая информация</h2>
            <p>При регистрации и использовании Сервиса мы собираем следующие данные:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Имя и фамилия</li>
              <li>Адрес электронной почты</li>
              <li>Номер телефона</li>
              <li>Город проживания</li>
              <li>Фотография профиля (по желанию)</li>
              <li>Информация об объявлениях и сделках</li>
              <li>История сообщений</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3 text-gray-900">3. Цели обработки данных</h2>
            <p>Мы используем ваши персональные данные для:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Создания и управления учетной записью</li>
              <li>Обеспечения функционирования платформы</li>
              <li>Связи между покупателями и продавцами</li>
              <li>Обработки безопасных сделок</li>
              <li>Предотвращения мошенничества</li>
              <li>Улучшения качества сервиса</li>
              <li>Направления уведомлений о статусе сделок</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3 text-gray-900">4. Защита данных</h2>
            <p>
              Мы применяем технические и организационные меры для защиты ваших данных от 
              несанкционированного доступа, изменения, раскрытия или уничтожения:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Шифрование паролей</li>
              <li>Защищенное соединение HTTPS</li>
              <li>Ограниченный доступ к персональным данным</li>
              <li>Регулярные проверки безопасности</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3 text-gray-900">5. Ваши права</h2>
            <p>Вы имеете право:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Получать доступ к своим персональным данным</li>
              <li>Исправлять неточные данные</li>
              <li>Удалять свою учетную запись и данные</li>
              <li>Отозвать согласие на обработку данных</li>
              <li>Получить копию своих данных</li>
            </ul>
          </section>

          <div className="bg-gray-100 p-4 rounded-lg mt-8">
            <p className="text-sm text-gray-600">
              Дата последнего обновления: {new Date().toLocaleDateString('ru-RU')}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
