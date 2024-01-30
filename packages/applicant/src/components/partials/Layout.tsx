import getConfig from 'next/config';
import { FC, ReactNode, useEffect } from 'react';
import Footer from './Footer';
import Header from './Header';
import { NavigationBar } from './navigation';
import { useAuth } from '../../pages/_app.page';

const { publicRuntimeConfig } = getConfig();

declare global {
  interface Window {
    GOVUKFrontend: {
      initAll: () => void;
    };
  }
}
interface LayoutPropsType {
  backBtnUrl?: string;
  children: ReactNode;
  isUserLoggedIn?: boolean;
}

const Layout: FC<LayoutPropsType> = ({ children, backBtnUrl = null }) => {
  const { isUserLoggedIn, oneLoginEnabledInFind } = useAuth();
  useEffect(() => {
    const GOVUKFrontend = window.GOVUKFrontend;
    if (typeof GOVUKFrontend !== 'undefined') {
      GOVUKFrontend.initAll();
    }
  }, []);

  return (
    <>
      <Header
        oneLoginEnabledInFind={oneLoginEnabledInFind}
        isUserLoggedIn={isUserLoggedIn}
      />
      {isUserLoggedIn && oneLoginEnabledInFind === 'true' && <NavigationBar />}
      <div className="govuk-width-container">
        {backBtnUrl && (
          <a
            href={publicRuntimeConfig.subPath + backBtnUrl}
            className="govuk-back-link"
            data-cy="cy-back-button"
          >
            Back
          </a>
        )}
        <main
          className="govuk-main-wrapper govuk-main-wrapper--auto-spacing"
          id="main-content"
          role="main"
        >
          {children}
        </main>
      </div>
      <Footer />
    </>
  );
};

export default Layout;
