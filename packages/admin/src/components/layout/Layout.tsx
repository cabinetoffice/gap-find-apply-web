import { ReactNode, useEffect } from 'react';
import CookieBanner from './cookie-banner';
import Footer from './Footer';
import Header from './Header';
import Meta from './Meta';

const Layout = ({ children, showCookieBanner }: LayoutProps) => {
  const clx = ['js-enabled', 'govuk-template__body'];
  useEffect(() => {
    document.querySelector('body')?.classList.add(...clx);
  });

  useEffect(() => {
    const GOVUKFrontend = window.GOVUKFrontend;
    if (typeof GOVUKFrontend !== 'undefined') {
      GOVUKFrontend.initAll();
    }
  }, []);

  return (
    <>
      {showCookieBanner && <CookieBanner />}
      <Meta />
      <Header />
      <div className="govuk-width-container">
        <main
          id="main-content"
          className="govuk-main-wrapper govuk-main-wrapper--auto-spacing govuk-!-padding-top-0"
          role="main"
        >
          {children}
        </main>
      </div>
      <Footer />
    </>
  );
};

interface LayoutProps {
  children: ReactNode;
  showCookieBanner: boolean;
}

export default Layout;
