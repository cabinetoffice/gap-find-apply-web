import Link from 'next/link';
import SpecificErrorMessage from '../displayErrors/specificMessageError/SpecificErrorMessage';
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
      <SpecificErrorMessage
        errors={errors}
        errorType={'notification_privacy'}
      />
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
            <Link
              href="/info/privacy"
              passHref
              target="_blank"
              className="govuk-link"
              rel="noreferrer"
              data-cy="cySignUpFormPrivacyLink"
            >
              privacy notice
            </Link>
          </label>
        </div>
      </div>
    </>
  );
};

export default PrivacyNotice;
