import React from 'react';
import { DateValues } from '../../../types/InputType';
import { ErrorMessage } from '../../display-errors';
import { InputComponentProps } from './InputComponentProps';

const DateInput = ({
  questionTitle,
  titleSize = 'l',
  questionHintText,
  fieldName,
  fieldErrors,
  defaultValues,
  disabled = false,
  TitleTag = 'h1',
}: DateInputProps) => {
  const hasError = fieldErrors.some((fieldError) =>
    fieldError.fieldName.startsWith(fieldName)
  );
  const isInFieldErrors = (inputId: string): boolean => {
    const fieldError = fieldErrors.find((fieldError) =>
      fieldError.fieldName.startsWith(fieldName)
    );
    if (!fieldError) return false;
    const regex = new RegExp(inputId, 'i');
    return (
      (fieldError.fieldName === `${fieldName}-day` &&
        fieldError.errorMessage === `You must enter a date`) ||
      regex.test(fieldError.errorMessage)
    );
  };

  return (
    <div
      data-testid="dateGroupDiv"
      className={`govuk-form-group ${
        hasError ? 'govuk-form-group--error' : ''
      }`}
      id={fieldName}
    >
      <fieldset
        className="govuk-fieldset"
        role="group"
        aria-describedby={`${fieldName}-hint`}
      >
        <legend
          className={`govuk-fieldset__legend govuk-fieldset__legend--${titleSize}`}
          data-testid="title-legend"
        >
          <TitleTag
            className="govuk-fieldset__heading"
            data-cy={`cy-${fieldName}-question-title`}
          >
            {questionTitle}
          </TitleTag>
        </legend>

        <div
          id={`${fieldName}-hint`}
          className={`govuk-hint gap-new-line`}
          data-testid={`${fieldName}-hint`}
          data-cy={`cy-${fieldName}-question-hint`}
        >
          {questionHintText ? `${questionHintText}\n\n` : ''}
          {'For example, 31 3 2023'}
        </div>

        {hasError && (
          <ErrorMessage fieldErrors={fieldErrors} fieldName={fieldName} />
        )}

        <div className="govuk-date-input" id={`${fieldName}-date`}>
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
                  isInFieldErrors('day') ? 'govuk-input--error' : ''
                }`}
                id={`${fieldName}-day`}
                name={`${fieldName}-day`}
                defaultValue={defaultValues?.day}
                type="text"
                pattern="[0-9]*"
                inputMode="numeric"
                data-testid={`${fieldName}-day`}
                data-cy={`cyDateFilter-${fieldName}Day`}
                disabled={disabled}
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
                  isInFieldErrors(`month`) ? 'govuk-input--error' : ''
                }`}
                id={`${fieldName}-month`}
                name={`${fieldName}-month`}
                defaultValue={defaultValues?.month}
                type="text"
                pattern="[0-9]*"
                inputMode="numeric"
                data-testid={`${fieldName}-month`}
                data-cy={`cyDateFilter-${fieldName}Month`}
                disabled={disabled}
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
                  isInFieldErrors(`year`) ? 'govuk-input--error' : ''
                }`}
                id={`${fieldName}-year`}
                name={`${fieldName}-year`}
                defaultValue={defaultValues?.year}
                type="text"
                pattern="[0-9]*"
                inputMode="numeric"
                data-testid={`${fieldName}-year`}
                data-cy={`cyDateFilter-${fieldName}Year`}
                disabled={disabled}
              />
            </div>
          </div>
        </div>
      </fieldset>
    </div>
  );
};

export interface DateInputProps extends InputComponentProps {
  defaultValues?: DateValues;
  disabled?: boolean;
}

export default DateInput;
