import { DatePicker } from '../date-picker/DatePicker';

type DateFieldProps = {
  fieldName: string;
  header?: string;
  hint?: string;
  values?: any;
  datePicker?: boolean;
  error?: {
    day?: boolean;
    month?: boolean;
    year?: boolean;
  };
};

export const DateField = ({
  fieldName,
  header,
  hint,
  values,
  datePicker,
  error,
}: DateFieldProps) => {
  return (
    <div
      className={`govuk-form-group withDatePicker ${
        datePicker && fieldName ? `${fieldName}` : ''
      }`}
    >
      <fieldset
        className="govuk-fieldset"
        role="group"
        aria-describedby={hint ? `${fieldName}-hint` : ''}
      >
        <legend className="govuk-fieldset__legend">
          {header && (
            <legend className="govuk-fieldset__legend govuk-fieldset__legend--l">
              <h1 className="govuk-fieldset__heading">{header}</h1>
            </legend>
          )}
          {hint && (
            <div
              id={`${fieldName}-hint`}
              className="govuk-hint"
              data-testid={`${fieldName}-hint`}
            >
              {hint}
            </div>
          )}

          <div
            className="govuk-date-input"
            id={`${fieldName}-date-range-fields`}
          >
            <div className="govuk-date-input__item">
              <div className="govuk-form-group">
                <label
                  className="govuk-label govuk-date-input__label"
                  htmlFor={`${fieldName}-day`}
                >
                  Day
                </label>
                <input
                  className={`govuk-input govuk-date-input__input govuk-input--width-2 ${
                    error?.day ? 'govuk-input--error' : ''
                  }`}
                  id={`${fieldName}-day`}
                  name={`${fieldName}-day`}
                  defaultValue={values?.day}
                  type="text"
                  pattern="[0-9]*"
                  inputMode="numeric"
                  data-testid={`${fieldName}-day`}
                  data-cy={`cyDateFilter-${fieldName}Day`}
                />
              </div>
            </div>
            <div className="govuk-date-input__item">
              <div className="govuk-form-group">
                <label
                  className="govuk-label govuk-date-input__label"
                  htmlFor={`${fieldName}-month`}
                >
                  Month
                </label>
                <input
                  className={`govuk-input govuk-date-input__input govuk-input--width-2 ${
                    error?.month ? 'govuk-input--error' : ''
                  }`}
                  id={`${fieldName}-month`}
                  name={`${fieldName}-month`}
                  defaultValue={values?.month}
                  type="text"
                  pattern="[0-9]*"
                  inputMode="numeric"
                  data-testid={`${fieldName}-month`}
                  data-cy={`cyDateFilter-${fieldName}Month`}
                />
              </div>
            </div>
            <div className="govuk-date-input__item">
              <div className="govuk-form-group">
                <label
                  className="govuk-label govuk-date-input__label"
                  htmlFor={`${fieldName}-year`}
                >
                  Year
                </label>
                <input
                  className={`govuk-input govuk-date-input__input govuk-input--width-4 ${
                    error?.year ? 'govuk-input--error' : ''
                  }`}
                  id={`${fieldName}-year`}
                  name={`${fieldName}-year`}
                  defaultValue={values?.year}
                  type="text"
                  pattern="[0-9]*"
                  inputMode="numeric"
                  data-testid={`${fieldName}-year`}
                  data-cy={`cyDateFilter-${fieldName}Year`}
                />
              </div>
            </div>
            <div className="govuk-date-input__item">
              {datePicker && fieldName && <DatePicker fieldName={fieldName} />}
            </div>
          </div>
        </legend>
      </fieldset>
    </div>
  );
};
