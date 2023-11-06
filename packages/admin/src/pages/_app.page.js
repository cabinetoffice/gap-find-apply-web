import App from 'next/app';
import getConfig from 'next/config';
import Script from 'next/script';
import nookies from 'nookies';
import { useEffect } from 'react';
import TagManager from 'react-gtm-module';
import '../../../../node_modules/gap-web-ui/dist/cjs/index.css';
import Layout from '../components/layout/Layout';
import { isAdminSessionValid } from '../services/UserService';
import '../lib/ie11_nodelist_polyfill';
import '../styles/globals.scss';

const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME;

const MyApp = ({ Component, pageProps, cookies, isUserLoggedIn }) => {
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
        src={`${publicRuntimeConfig.SUB_PATH}/javascript/govuk.js`}
        strategy="beforeInteractive"
      />
      <Layout
        isUserLoggedIn={isUserLoggedIn}
        showCookieBanner={showCookieBanner}
      >
        <Component {...pageProps} />
      </Layout>
    </>
  );
};

MyApp.getInitialProps = async (appContext) => {
  const appProps = await App.getInitialProps(appContext);
  const { req } = appContext.ctx;
  const sessionToken = req.cookies[SESSION_COOKIE_NAME];
  const isValidAdminSession = await isAdminSessionValid(sessionToken);
  const cookies =
    typeof window === 'undefined' ? {} : appContext.ctx.req.cookies;
  return { ...appProps, cookies, isUserLoggedIn: isValidAdminSession };
};

export default MyApp;
