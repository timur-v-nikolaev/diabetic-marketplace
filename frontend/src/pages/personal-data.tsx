import Head from 'next/head';

export default function PersonalData() {
  return (
    <>
      <Head>
        <title>Согласие на обработку персональных данных | Diabetic Marketplace</title>
      </Head>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Согласие на обработку персональных данных</h1>
        
        <div className="prose max-w-none space-y-6 text-gray-700">
          <section>
            <h2 className="text-2xl font-semibold mb-3 text-gray-900">1. Общие положения</h2>
            <p>
              Регистрируясь на платформе Diabetic Marketplace, я даю свое 
              согласие на обработку моих персональных данных в соответствии с Федеральным законом 
              от 27.07.2006 № 152-ФЗ «О персональных данных».
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3 text-gray-900">2. Перечень персональных данных</h2>
            <p>Я предоставляю согласие на обработку следующих персональных данных:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Фамилия, имя, отчество</li>
              <li>Адрес электронной почты</li>
              <li>Номер телефона</li>
              <li>Город проживания</li>
              <li>Фотография (при загрузке)</li>
              <li>Данные об активности на платформе</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3 text-gray-900">3. Цели обработки</h2>
            <p>Персональные данные обрабатываются в следующих целях:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Регистрация и авторизация на платформе</li>
              <li>Предоставление доступа к функционалу Сервиса</li>
              <li>Обеспечение коммуникации между пользователями</li>
              <li>Проведение безопасных сделок</li>
              <li>Отправка уведомлений</li>
              <li>Предотвращение мошенничества</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3 text-gray-900">4. Срок действия согласия</h2>
            <p>
              Настоящее согласие действует с момента регистрации на платформе и до момента 
              удаления учетной записи или письменного отзыва согласия.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3 text-gray-900">5. Права субъекта данных</h2>
            <p>Я осознаю, что имею следующие права:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Получать информацию о наличии и содержании моих персональных данных</li>
              <li>Требовать уточнения или удаления персональных данных</li>
              <li>Отозвать настоящее согласие</li>
              <li>Обжаловать действия оператора в уполномоченный орган</li>
            </ul>
          </section>

          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mt-8">
            <p className="text-sm text-blue-900">
              <strong>Важно:</strong> Без предоставления согласия на обработку персональных данных 
              регистрация на платформе невозможна.
            </p>
          </div>

          <div className="bg-gray-100 p-4 rounded-lg mt-4">
            <p className="text-sm text-gray-600">
              Дата последнего обновления: {new Date().toLocaleDateString('ru-RU')}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
