import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Script from 'next/script';
import Layout from '../components/Layout';
import { TelegramProvider } from '../contexts/TelegramContext';
import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  
  // Не оборачивать в Layout страницы VK и TG Mini Apps
  const pathname = router.pathname || '';
  const isMiniApp = pathname.startsWith('/vk') || pathname.startsWith('/tg');

  // Для Mini Apps - рендерим без Layout
  if (isMiniApp) {
    return (
      <>
        <Head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        </Head>
        <Component {...pageProps} />
      </>
    );
  }

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </Head>
      {/* Telegram Web App SDK */}
      <Script src="https://telegram.org/js/telegram-web-app.js" strategy="beforeInteractive" />
      <TelegramProvider>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </TelegramProvider>
    </>
  );
}
