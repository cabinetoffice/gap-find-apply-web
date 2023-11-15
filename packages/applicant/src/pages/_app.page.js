import App from 'next/app';
import getConfig from 'next/config';
import Script from 'next/script';
import nookies from 'nookies';
import { createContext, useContext, useEffect } from 'react';
import TagManager from 'react-gtm-module';
import CookieBanner from '../components/partials/cookie-banner';
import '../lib/ie11_nodelist_polyfill';
import '../styles/globals.scss';
import '../../../../node_modules/gap-web-ui/dist/cjs/index.css';
import { verifyToken } from '../services/JwtService';

const USER_TOKEN_NAME = process.env.USER_TOKEN_NAME;

export const AuthContext = createContext({
  oneLoginEnabledInFind: null,
  isUserLoggedIn: false,
});

export const useAuth = () => useContext(AuthContext);

const MyApp = ({
  Component,
  pageProps,
  cookies,
  isUserLoggedIn,
  oneLoginEnabledInFind,
}) => {
  const { publicRuntimeConfig } = getConfig();

  const showCookieBanner = !cookies?.design_system_cookies_policy;

  useEffect(() => {
    const cookiesToDelete = [
      '_gid',
      '_gat_UA-219136711-1',
      '_ga',
      '_ga_RZMG2XBH9M',
    ];
    if (cookies) {
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
    }
  }, [cookies]);
  return (
    <>
      <Script
        src={`${publicRuntimeConfig.subPath}/javascript/govuk.js`}
        strategy="beforeInteractive"
      />
      {showCookieBanner && <CookieBanner />}
      <AuthContext.Provider value={{ isUserLoggedIn, oneLoginEnabledInFind }}>
        <Component {...pageProps} />
      </AuthContext.Provider>
    </>
  );
};

MyApp.getInitialProps = async (appContext) => {
  const appProps = await App.getInitialProps(appContext);
  const oneLoginEnabledInFind = process?.env
    ? process.env.ONE_LOGIN_ENABLED_IN_FIND
    : null;
  const { req } = appContext.ctx;
  const userServiceToken = req.cookies[USER_TOKEN_NAME];
  const cookies =
    typeof window === 'undefined'
      ? appContext.ctx.req.cookies
      : nookies.get({});

  try {
    const { valid } = await verifyToken(userServiceToken);
    return {
      ...appProps,
      isUserLoggedIn: valid || false,
      cookies,
      oneLoginEnabledInFind,
    };
  } catch (e) {
    return { ...appProps, isUserLoggedIn: false, cookies };
  }
};

export default MyApp;
