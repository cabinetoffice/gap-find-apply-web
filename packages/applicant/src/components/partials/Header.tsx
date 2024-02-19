/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import { FC } from 'react';
import { isIE } from 'react-device-detect';
import styles from './Header.module.scss';
import { getLoginUrl } from '../../utils/general';
import { MobileNavigationBar } from './navigation';
import { useAuth } from '../../pages/_app.page';

interface HeaderProps {
  isUserLoggedIn?: boolean;
  oneLoginEnabledInFind?: string;
}

const Header: FC<HeaderProps> = ({ isUserLoggedIn, oneLoginEnabledInFind }) => {
  const feedbackContent = `https://docs.google.com/forms/d/e/1FAIpQLSeZnNVCqmtnzfZQJSBW_k9CklS2Y_ym2GRt-z0-1wf9pDEgPw/viewform`;
  const { isSuperAdmin } = useAuth();

  return (
    <>
      {/* SKIP LINK */}
      <a
        href="#main-content"
        className="govuk-skip-link"
        data-module="govuk-skip-link"
        data-cy="cySkipLink"
      >
        Skip to main content
      </a>

      {/* HEADER BLOCK */}
      <header
        className="govuk-header "
        role="banner"
        data-module="govuk-header"
      >
        <div className="govuk-header__container govuk-width-container">
          <div className="govuk-header__logo">
            <Link
              href="https://www.gov.uk/"
              className="govuk-header__link govuk-header__link--homepage"
            >
              <span className="govuk-header__logotype">
                {isIE ? (
                  <>
                    <img
                      src="/assets/images/govuk-logotype-crown.png"
                      className="govuk-header__logotype-crown-fallback-image"
                      alt="uk government crown logo"
                      width="36"
                      height="32"
                    />
                  </>
                ) : (
                  <>
                    <svg
                      aria-hidden="true"
                      focusable="false"
                      className="govuk-header__logotype-crown"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 32 30"
                      height="30"
                      width="32"
                    >
                      <path
                        fill="currentColor"
                        fillRule="evenodd"
                        d="M22.6 10.4c-1 .4-2-.1-2.4-1-.4-.9.1-2 1-2.4.9-.4 2 .1 2.4 1s-.1 2-1 2.4m-5.9 6.7c-.9.4-2-.1-2.4-1-.4-.9.1-2 1-2.4.9-.4 2 .1 2.4 1s-.1 2-1 2.4m10.8-3.7c-1 .4-2-.1-2.4-1-.4-.9.1-2 1-2.4.9-.4 2 .1 2.4 1s0 2-1 2.4m3.3 4.8c-1 .4-2-.1-2.4-1-.4-.9.1-2 1-2.4.9-.4 2 .1 2.4 1s-.1 2-1 2.4M17 4.7l2.3 1.2V2.5l-2.3.7-.2-.2.9-3h-3.4l.9 3-.2.2c-.1.1-2.3-.7-2.3-.7v3.4L15 4.7c.1.1.1.2.2.2l-1.3 4c-.1.2-.1.4-.1.6 0 1.1.8 2 1.9 2.2h.7c1-.2 1.9-1.1 1.9-2.1 0-.2 0-.4-.1-.6l-1.3-4c-.1-.2 0-.2.1-.3m-7.6 5.7c.9.4 2-.1 2.4-1 .4-.9-.1-2-1-2.4-.9-.4-2 .1-2.4 1s0 2 1 2.4m-5 3c.9.4 2-.1 2.4-1 .4-.9-.1-2-1-2.4-.9-.4-2 .1-2.4 1s.1 2 1 2.4m-3.2 4.8c.9.4 2-.1 2.4-1 .4-.9-.1-2-1-2.4-.9-.4-2 .1-2.4 1s0 2 1 2.4m14.8 11c4.4 0 8.6.3 12.3.8 1.1-4.5 2.4-7 3.7-8.8l-2.5-.9c.2 1.3.3 1.9 0 2.7-.4-.4-.8-1.1-1.1-2.3l-1.2 4c.7-.5 1.3-.8 2-.9-1.1 2.5-2.6 3.1-3.5 3-1.1-.2-1.7-1.2-1.5-2.1.3-1.2 1.5-1.5 2.1-.1 1.1-2.3-.8-3-2-2.3 1.9-1.9 2.1-3.5.6-5.6-2.1 1.6-2.1 3.2-1.2 5.5-1.2-1.4-3.2-.6-2.5 1.6.9-1.4 2.1-.5 1.9.8-.2 1.1-1.7 2.1-3.5 1.9-2.7-.2-2.9-2.1-2.9-3.6.7-.1 1.9.5 2.9 1.9l.4-4.3c-1.1 1.1-2.1 1.4-3.2 1.4.4-1.2 2.1-3 2.1-3h-5.4s1.7 1.9 2.1 3c-1.1 0-2.1-.2-3.2-1.4l.4 4.3c1-1.4 2.2-2 2.9-1.9-.1 1.5-.2 3.4-2.9 3.6-1.9.2-3.4-.8-3.5-1.9-.2-1.3 1-2.2 1.9-.8.7-2.3-1.2-3-2.5-1.6.9-2.2.9-3.9-1.2-5.5-1.5 2-1.3 3.7.6 5.6-1.2-.7-3.1 0-2 2.3.6-1.4 1.8-1.1 2.1.1.2.9-.3 1.9-1.5 2.1-.9.2-2.4-.5-3.5-3 .6 0 1.2.3 2 .9l-1.2-4c-.3 1.1-.7 1.9-1.1 2.3-.3-.8-.2-1.4 0-2.7l-2.9.9C1.3 23 2.6 25.5 3.7 30c3.7-.5 7.9-.8 12.3-.8"
                      ></path>
                    </svg>
                  </>
                )}
                <span
                  className="govuk-header__logotype-text"
                  data-cy="cyGovLogoLink"
                >
                  {' '}
                  GOV.UK
                </span>
              </span>
            </Link>
          </div>

          <div className="govuk-header__content">
            <div className="govuk-header__content">
              <a
                href="/"
                className="govuk-header__link govuk-header__link--service-name"
              >
                Find a grant
              </a>
            </div>
            {isSuperAdmin && (
              <div
                className={`${styles['super-admin-link']} super-admin-link govuk-!-padding-top-2`}
              >
                <a
                  href={`${process.env.ADMIN_FRONTEND_URL}/super-admin-dashboard`}
                  className="govuk-header__link   govuk-!-font-weight-bold"
                >
                  Superadmin Dashboard
                </a>
              </div>
            )}
          </div>
        </div>
      </header>
      {isUserLoggedIn && oneLoginEnabledInFind === 'true' && (
        <MobileNavigationBar isSuperAdmin={isSuperAdmin} />
      )}
      {/* SIGN IN/OUT */}
      <div className="govuk-width-container govuk-!-text-align-right">
        <p
          className={`govuk-phase-banner__content govuk-!-margin-right-0 govuk-phase-banner__text ${styles['float-right']} govuk-!-font-size-19`}
        >
          {isUserLoggedIn ? (
            <Link
              href={'/api/logout'}
              className="govuk-link govuk-link--no-visited-state"
            >
              Sign out
            </Link>
          ) : (
            <a
              href={getLoginUrl()}
              className="govuk-link govuk-link--no-visited-state"
            >
              Sign in
            </a>
          )}
        </p>
      </div>
      {/* BETA BLOCK */}
      <div className="govuk-width-container ">
        <div className="govuk-phase-banner">
          <p className="govuk-phase-banner__content">
            <strong className="govuk-tag govuk-phase-banner__content__tag">
              BETA
            </strong>
            <span className="govuk-phase-banner__text">
              This is a new service – your{' '}
              <Link
                href={feedbackContent}
                className="govuk-link"
                target="_blank"
                data-cy="cyBetaFeedbackLinkBanner"
              >
                feedback
              </Link>{' '}
              will help us to improve it.
            </span>
          </p>
        </div>
      </div>
    </>
  );
};

export default Header;
