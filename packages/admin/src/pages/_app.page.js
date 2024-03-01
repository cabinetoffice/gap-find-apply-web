'use client';

import App from 'next/app';
import getConfig from 'next/config';
import Script from 'next/script';
import nookies from 'nookies';
import { createContext, useContext, useEffect } from 'react';
import TagManager from 'react-gtm-module';
import '../../../../node_modules/gap-web-ui/dist/cjs/index.css';
import Layout from '../components/layout/Layout';
import '../lib/ie11_nodelist_polyfill';
import '../styles/globals.scss';
import { getUserRoles } from '../services/UserService';

const USER_TOKEN_NAME = process.env.JWT_COOKIE_NAME;
export const AuthContext = createContext({
  isSuperAdmin: false,
});
export const useAdminAuth = () => useContext(AuthContext);

const MyApp = ({ Component, pageProps, cookies, isSuperAdmin }) => {
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
      <AuthContext.Provider value={{ isSuperAdmin }}>
        <Layout showCookieBanner={showCookieBanner}>
          <Component {...pageProps} />
        </Layout>
      </AuthContext.Provider>
    </>
  );
};

MyApp.getInitialProps = async (appContext) => {
  const appProps = await App.getInitialProps(appContext);
  const { req } = appContext.ctx;
  const userServiceToken = req.cookies[USER_TOKEN_NAME];
  const cookies =
    typeof window === 'undefined'
      ? appContext.ctx.req.cookies
      : nookies.get({});

  try {
    const isSuperAdmin = (await getUserRoles(userServiceToken)).isSuperAdmin;
    return { ...appProps, cookies, isSuperAdmin };
  } catch (e) {
    return { ...appProps, cookies, isSuperAdmin: false };
  }
};

export default MyApp;
