import Footer from '../components/layout/Footer';
import Header from '../components/layout/Header';
import Meta from '../components/layout/Meta';
import '../styles/globals.scss';
import '../../../../node_modules/gap-web-ui/dist/cjs/index.css';
import '../lib/ie11_nodelist_polyfill';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <Meta />

      <body className="govuk-template__body">
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
      </body>
    </html>
  );
}