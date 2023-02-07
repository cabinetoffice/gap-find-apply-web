import ErrorBanner from '../displayErrors/errorBanner/ErrorBanner';
import PrivacyNotice from './PrivacyNotice';
import SpecificErrorMessage from '../displayErrors/specificMessageError/SpecificErrorMessage';

/**
 * Generic sign up component to be used when asking users to sign up with an email address.
 * Customizable through the use of the formData object.
 *
 * @param {Object} formdata
 * @param {Array} errors
 * @param {Object} previousFormValues
 * @returns SignupForm component for use in user email sign up journeys
 */

const SignupForm = ({ formData, errors, previousFormValues }) => {
  return (
    <>
      <ErrorBanner errors={errors} />

      <form
        action={formData.action}
        method="POST"
        noValidate
        data-testid="signup-form"
      >
        {formData.fields && formData.fields.map((field) => field)}

        <div
          data-testid="red-banner"
          className={`govuk-form-group ${
            errors.length > 0 ? 'govuk-form-group--error' : ''
          }`}
        >
          <h1
            className="govuk-heading-l govuk-!-margin-top-4 govuk-!-margin-bottom-4"
            id="main-content-focus"
            tabIndex={-1}
          >
            Enter your email address
          </h1>
          <label className="govuk-label">{formData.resultingAction}</label>

          <PrivacyNotice
            errors={errors}
            checked={previousFormValues.notification_privacy}
          />

          <SpecificErrorMessage errors={errors} errorType={'user_email'} />

          <input
            className={`govuk-input govuk-!-width-one-third ${
              errors.some((error) => error.field === 'user_email')
                ? 'govuk-input--error'
                : ''
            }`}
            id="user_email"
            data-testid="user_email"
            name="user_email"
            aria-label="Enter your email address"
            spellCheck="false"
            autoComplete="email"
            defaultValue={previousFormValues.user_email}
            data-cy="cyNotificationPrivacyEmail"
            placeholder="Enter your email address"
          />
        </div>
        <button
          className="govuk-button"
          data-module="govuk-button"
          data-cy="cySubmitSignupDetails"
          type="submit"
          aria-label="Submit email address"
        >
          Continue
        </button>
      </form>
    </>
  );
};

export default SignupForm;
