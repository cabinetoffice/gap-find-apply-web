import React from 'react';
import Link from '../../components/custom-link/CustomLink';
import { ErrorMessage } from 'gap-web-ui';
/**
 * Generic component to include gov uk's privacy notice within forms.
 *
 * @param {Array} errors - An Array of error objects.
 * @param {boolean} checked - Boolean value to set initial checkbox state.
 * @returns PrivacyNotice component for use in forms.
 */
const PrivacyNotice = ({ errors, checked }) => {
  return (
    <>
      <ErrorMessage fieldErrors={errors} fieldName={'notification_privacy'} />
      <div
        className="govuk-checkboxes govuk-checkboxes--small govuk-!-margin-bottom-1 gap_flex"
        data-testid="notification_privacy_field"
        data-module="govuk-checkboxes"
      >
        <div className="govuk-checkboxes__item">
          <input
            id="notification_privacy"
            data-testid="notification_privacy"
            aria-label="Privacy Notice Checkbox"
            name="notification_privacy"
            type="checkbox"
            className="govuk-checkboxes__input"
            defaultChecked={checked}
            data-cy="cyNotificationPrivacyCheckbox"
          />
          <label
            className="govuk-label govuk-checkboxes__label"
            htmlFor="notification_privacy"
          >
            I have read and understood the&nbsp;
            <Link href="/info/privacy" passHref>
              <a
                target="_blank"
                className="govuk-link"
                rel="noreferrer"
                data-cy="cySignUpFormPrivacyLink"
              >
                privacy notice
              </a>
            </Link>
          </label>
        </div>
      </div>
    </>
  );
};

export default PrivacyNotice;
