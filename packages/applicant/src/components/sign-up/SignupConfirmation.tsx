import React from 'react';

interface ReturnParams {
  href: string;
  linkText: string;
}

type SignupConfirmationProps = {
  signedUpEmail: string;
  subscribedTo: string;
  displayBold: boolean;
  returnParams: ReturnParams;
  children: React.ReactNode;
};

/**
 * Generic component to show confirmation messages to newly signe up users.
 *
 * @param {string} signedUpEmail
 * @param {string} subscribedTo
 * @param {boolean} displayBold
 * @param {ReturnParams} returnParams
 * @returns SignupConfirmation Component
 */
const SignupConfirmation = ({
  signedUpEmail,
  subscribedTo,
  displayBold,
  returnParams,
  children: releventLinks,
}: SignupConfirmationProps) => {
  return (
    <>
      <div>
        <div className="govuk-grid-column-two-third">
          <h1
            className="govuk-heading-l govuk-!-margin-top-4 govuk-!-margin-bottom-4"
            id="main-content-focus"
            tabIndex={-1}
          >
            Check your email
          </h1>
        </div>
      </div>

      <div className="govuk-grid-row govuk-body">
        <div className="govuk-grid-column-two-thirds">
          <p className="govuk-body">
            We&apos;ve sent an email to{' '}
            <span
              className="govuk-!-font-weight-bold"
              data-testid="email"
              data-cy="cySignUpCheckEmail"
            >
              {signedUpEmail}
            </span>
          </p>
          <p
            className="govuk-body"
            data-testid="signed_up_to_text"
            data-cy="cySignUpCheckEmailMessage"
          >
            Click the link in the email to confirm you want updates about
            {!displayBold ? ` ${subscribedTo}.` : ':'}
          </p>
          {displayBold && (
            <h2
              className="govuk-body govuk-!-font-weight-bold"
              data-testid="signed_up_to_bold"
              data-cy="cySignUpCheckSubscribedTo"
            >
              {subscribedTo}
            </h2>
          )}
          <p className="govuk-body">The link will stop working after 7 days.</p>
          <details
            className="govuk-details"
            data-module="govuk-details"
            aria-label="details"
          >
            <summary className="govuk-details__summary">
              <span className="govuk-details__summary-text">
                Not received an email?
              </span>
            </summary>
            <div className="govuk-details__text">
              <p>Emails sometimes take a few minutes to arrive.</p>
              <p>
                If you do not receive an email soon, check your spam or junk
                folder.
              </p>
              <p>
                If you do not get an email, contact{' '}
                <a
                  href="mailto:findagrant@cabinetoffice.gov.uk"
                  className="govuk-link"
                >
                  findagrant@cabinetoffice.gov.uk
                </a>
                .
              </p>
            </div>
          </details>
          <a
            href={returnParams.href}
            className="govuk-link"
            data-cy="cySignupConfirmationReturnToLink"
          >
            {returnParams.linkText}
          </a>
        </div>

        {releventLinks}
      </div>
    </>
  );
};

export default SignupConfirmation;
