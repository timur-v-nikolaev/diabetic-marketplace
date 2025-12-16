import Head from 'next/head';

export default function Terms() {
  return (
    <>
      <Head>
        <title>Пользовательское соглашение | Diabetic Marketplace</title>
      </Head>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Пользовательское соглашение</h1>
        
        <div className="prose max-w-none space-y-6 text-gray-700">
          <section>
            <h2 className="text-2xl font-semibold mb-3 text-gray-900">1. Общие условия</h2>
            <p>
              Настоящее Пользовательское соглашение (далее — «Соглашение») регулирует отношения 
              между платформой Diabetic Marketplace (далее — «Сервис») и пользователями Сервиса.
            </p>
            <p>
              Регистрируясь на платформе, вы подтверждаете, что ознакомились с условиями настоящего 
              Соглашения и принимаете их в полном объеме.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3 text-gray-900">2. Регистрация и учетная запись</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Для использования Сервиса необходимо создать учетную запись</li>
              <li>Вы обязуетесь предоставлять достоверную информацию</li>
              <li>Вы несете ответственность за сохранность пароля</li>
              <li>Запрещается передавать доступ к учетной записи третьим лицам</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3 text-gray-900">3. Размещение объявлений</h2>
            <p>При размещении объявлений вы обязуетесь:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Указывать достоверную информацию о товаре</li>
              <li>Не размещать запрещенные законом товары</li>
              <li>Использовать только собственные фотографии</li>
              <li>Указывать актуальные цены</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3 text-gray-900">4. Безопасные сделки</h2>
            <p>
              Сервис предоставляет функционал безопасных сделок для защиты интересов покупателей 
              и продавцов с системой отслеживания статуса сделки и механизмом разрешения споров.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3 text-gray-900">5. Ответственность</h2>
            <p>
              Сервис выступает в роли платформы, соединяющей покупателей и продавцов. 
              Мы не несем ответственности за качество товаров и выполнение обязательств между пользователями.
            </p>
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
