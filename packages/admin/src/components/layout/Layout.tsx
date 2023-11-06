import { ReactNode, useEffect } from 'react';
import CookieBanner from './cookie-banner';
import Footer from './Footer';
import Header from './Header';
import Meta from './Meta';
import { NavigationBar } from './navigation';
import { useRouter } from 'next/router';

const Layout = ({
  children,
  showCookieBanner,
  isUserLoggedIn = false,
}: LayoutProps) => {
  const { pathname } = useRouter();
  const isSuperAdminDashboardPage = /super-admin-dashboard/.test(pathname);
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
      <Header isUserLoggedIn={isUserLoggedIn} />
      {isUserLoggedIn && !isSuperAdminDashboardPage && <NavigationBar />}
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
  isUserLoggedIn: boolean;
  children: ReactNode;
  showCookieBanner: boolean;
}

export default Layout;
