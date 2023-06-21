import App from 'next/app';
import getConfig from 'next/config';
import Script from 'next/script';
import nookies from 'nookies';
import { useEffect } from 'react';
import TagManager from 'react-gtm-module';
import CookieBanner from '../components/partials/cookie-banner';
import '../lib/ie11_nodelist_polyfill';
import '../styles/globals.scss';
import '../../../../node_modules/gap-web-ui/dist/cjs/index.css';

const MyApp = ({ Component, pageProps, cookies }) => {
  const { publicRuntimeConfig } = getConfig();
  const showCookieBanner = !cookies.design_system_cookies_policy;

  useEffect(() => {
    const cookiesToDelete = [
      '_gid',
      '_gat_UA-219136711-1',
      '_ga',
      '_ga_RZMG2XBH9M',
    ];
    if (cookies.design_system_cookies_policy === 'true') {
      if (typeof window !== 'undefined' || typeof document !== 'undefined') {
        TagManager.initialize({ gtmId: 'GTM-52T2C9G' });
      }
    } else {
      for (const element of Object.keys(cookies)) {
        if (cookiesToDelete.includes(element)) {
          nookies.destroy({}, element, { path: '/' });
        }
      }
    }
  }, [cookies]);
  return (
    <>
      <Script
        src={`${publicRuntimeConfig.subPath}/javascript/govuk.js`}
        strategy="beforeInteractive"
      />
      {showCookieBanner && <CookieBanner />}
      <Component {...pageProps} />
    </>
  );
};

MyApp.getInitialProps = async (appContext) => {
  const appProps = await App.getInitialProps(appContext);
  const cookies = appContext.ctx.req.cookies;
  return { ...appProps, cookies };
};

export default MyApp;
