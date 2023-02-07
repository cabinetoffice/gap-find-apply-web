import nookies from 'nookies';
import { useState } from 'react';
import TagManager from 'react-gtm-module';
const CookieBanner = () => {
  let cookies = nookies.get({});

  const [showCookiesContainer, setShowCookiesContainer] = useState(true);
  const [showCookiesStatement, setShowCookiesStatement] = useState(true);
  const [showAccept, setShowAccept] = useState(false);
  const [showReject, setShowReject] = useState(false);
  const [hasHideBeenClicked, setHasHideBeenClicked] = useState(false);

  const cookiesToDelete = [
    '_gid',
    '_gat_UA-219136711-1',
    '_ga',
    '_ga_RZMG2XBH9M',
  ];

  const rejectCookies = () => {
    for (const element of Object.keys(cookies)) {
      if (cookiesToDelete.includes(element)) {
        nookies.destroy({}, element, { path: '/' });
      }
    }

    nookies.set({}, 'design_system_cookies_policy', 'false', {
      maxAge: 365 * 24 * 60 * 60,
      path: '/',
    });
    setShowCookiesContainer(true);
    setHasHideBeenClicked(false);
    setShowCookiesStatement(false);
    setShowReject(true);
  };

  const acceptCookies = () => {
    nookies.set({}, 'design_system_cookies_policy', 'true', {
      maxAge: 365 * 24 * 60 * 60,
      path: '/',
    });
    TagManager.initialize({ gtmId: 'GTM-52T2C9G' });
    setShowCookiesContainer(true);
    setShowCookiesStatement(false);
    setHasHideBeenClicked(false);
    setShowAccept(true);
  };

  const hideWholeBanner = () => {
    setShowReject(false);
    setShowAccept(false);
    setShowCookiesContainer(false);
    setHasHideBeenClicked(true);
  };

  return (
    <div
      className="govuk-cookie-banner "
      data-nosnippet
      role="region"
      aria-label="Cookies on Apply for a grant"
      {...(!showCookiesContainer && { hidden: true })}
      aria-hidden={!showCookiesContainer}
    >
      <div
        className="govuk-cookie-banner__message govuk-width-container"
        {...(!showCookiesStatement && { hidden: true })}
        aria-hidden={!showCookiesStatement}
      >
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h2 className="govuk-cookie-banner__heading govuk-heading-m">
              Cookies on Apply for a grant
            </h2>

            <div className="govuk-cookie-banner__content">
              <p className="govuk-body">
                We use some essential cookies to make this service work.
              </p>
              <p className="govuk-body">
                We’d also like to use analytics cookies so we can understand how
                you use the service and make improvements.
              </p>
            </div>
          </div>
        </div>

        <div className="govuk-button-group">
          <button
            type="button"
            className="govuk-button"
            onClick={() => acceptCookies()}
            data-module="govuk-button"
          >
            Accept analytics cookies
          </button>
          <button
            type="button"
            className="govuk-button"
            onClick={() => rejectCookies()}
            data-module="govuk-button"
          >
            Reject analytics cookies
          </button>
          <a
            href="https://www.find-government-grants.service.gov.uk/info/cookies"
            target="_blank"
            rel="noreferrer"
            className="govuk-link"
          >
            View cookies
          </a>
        </div>
      </div>

      <div
        className="govuk-cookie-banner__message govuk-width-container"
        role="alert"
        {...(!showAccept && { hidden: true })}
        aria-hidden={!showAccept}
      >
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <div className="govuk-cookie-banner__content">
              <p className="govuk-body">
                You’ve accepted analytics cookies. You can{' '}
                <a
                  href="https://www.find-government-grants.service.gov.uk/info/cookies"
                  target="_blank"
                  rel="noreferrer"
                  className="govuk-link"
                >
                  change your cookie settings
                </a>{' '}
                at any time.
              </p>
            </div>
          </div>
        </div>

        <div className="govuk-button-group">
          <button
            className="govuk-button"
            data-module="govuk-button"
            onClick={() => hideWholeBanner()}
          >
            Hide this message
          </button>
        </div>
      </div>

      <div
        className="govuk-cookie-banner__message govuk-width-container"
        role="alert"
        {...(!showReject && { hidden: true })}
        aria-hidden={!showReject}
      >
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <div className="govuk-cookie-banner__content">
              <p className="govuk-body">
                You’ve rejected analytics cookies. You can{' '}
                <a
                  href="https://www.find-government-grants.service.gov.uk/info/cookies"
                  target="_blank"
                  rel="noreferrer"
                  className="govuk-link"
                >
                  change your cookie settings{' '}
                </a>
                at any time.
              </p>
            </div>
          </div>
        </div>

        <div className="govuk-button-group">
          <button
            className="govuk-button"
            data-module="govuk-button"
            onClick={() => hideWholeBanner()}
          >
            Hide this message
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;
