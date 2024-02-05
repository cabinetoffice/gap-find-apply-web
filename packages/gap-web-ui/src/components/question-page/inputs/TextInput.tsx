import React, { ReactNode } from 'react';
import { TextInputSubtype } from '../../../types/InputType';
import ErrorMessage from '../../display-errors/ErrorMessage';
import { InputComponentProps } from './InputComponentProps';
import { HARD_CHAR_LIMIT } from './constants';

const TextInput = ({
  children,
  questionTitle,
  boldHeading = true,
  titleSize = 'l',
  questionHintText,
  fieldName,
  fieldErrors,
  defaultValue = '',
  textInputSubtype,
  width,
  fluidWidth,
  readOnly = false,
  disabled = false,
  TitleTag = 'h1',
  newLineAccepted = false,
  fieldPrefix = '£',
  multipleQuestionPage = true,
  limit,
  limitWords = false,
}: TextInputComponentProps) => {
  const ariaDescribedByText: string = fieldName + '-hint';
  const hasError = fieldErrors.some((fieldError) =>
    fieldError.fieldName.startsWith(fieldName)
  );
  const requiredProps = {
    id: fieldName,
    className: `govuk-input govuk-js-character-count${
      hasError ? ' govuk-input--error' : ''
    }${width ? ` govuk-input--width-${width}` : ''}${
      fluidWidth ? ` govuk-!-width-${fluidWidth}` : ''
    }`,
    name: fieldName,
    type: 'text',
    'aria-describedby': questionHintText ? ariaDescribedByText : undefined,
    defaultValue: defaultValue,
    'data-testid': 'input-field',
    readOnly: readOnly,
    disabled: disabled,
  };

  const newLineClass = newLineAccepted ? `gap-new-line` : '';
  const labelClasses = multipleQuestionPage
    ? `govuk-label govuk-label--${titleSize}`
    : 'govuk-heading-l';

  const InputElement = () => {
    switch (textInputSubtype) {
      case 'email':
        return (
          <input
            {...requiredProps}
            type="email"
            spellCheck="false"
            autoComplete="email"
            data-cy={`cy-${fieldName}-text-input`}
          />
        );
      case 'nationalInsuranceNumber':
        return (
          <input
            {...requiredProps}
            className={`${requiredProps.className} govuk-input--width-10`}
            spellCheck="false"
          />
        );
      case 'numeric':
        return (
          <div className="govuk-input__wrapper">
            {fieldPrefix && (
              <div
                className="govuk-input__prefix"
                aria-hidden="true"
                data-cy={`cy-${fieldName}-text-input-prefix`}
              >
                {fieldPrefix}
              </div>
            )}
            <input
              {...requiredProps}
              spellCheck="false"
              data-cy={`cy-${fieldName}-text-input-numeric`}
            />
          </div>
        );
      default:
        return (
          <input
            {...requiredProps}
            data-cy={`cy-${fieldName}-text-input`}
            aria-describedby={`${fieldName}-info ${fieldName}-hint`}
          />
        );
    }
  };

  return (
    <div
      className="govuk-character-count"
      data-module="govuk-character-count"
      data-maxlength={!limitWords ? limit : undefined}
      data-maxwords={limitWords ? limit : undefined}
    >
      <div
        className={`govuk-form-group${
          hasError ? ' govuk-form-group--error' : ''
        }`}
        data-testid="text-input-component"
      >
        {!boldHeading ? (
          <label
            className="govuk-label"
            htmlFor={fieldName}
            data-cy={`cy-${fieldName}-question-title`}
          >
            {questionTitle}
          </label>
        ) : (
          <TitleTag
            className="govuk-label-wrapper"
            data-cy={`cy-${fieldName}-question-title`}
          >
            <label
              className={labelClasses}
              htmlFor={fieldName}
              data-testid={`${questionTitle?.replace(' ', '-')}-label`}
            >
              {questionTitle}
            </label>
          </TitleTag>
        )}

        {questionHintText && (
          <div
            id={`${fieldName}-hint`}
            className={`govuk-hint ${newLineClass}`}
            data-cy={`cy-${fieldName}-question-hint`}
          >
            {questionHintText}
          </div>
        )}

        <ErrorMessage fieldErrors={fieldErrors} fieldName={fieldName} />

        <InputElement />
        {limit && (
          <div
            id={`${fieldName}-info`}
            className="govuk-hint govuk-character-count__message"
            data-testid="character-limit-div"
          >
            {limitWords
              ? `You can enter up to ${limit} ${
                  limit > HARD_CHAR_LIMIT ? 'characters' : 'words'
                }`
              : `You can enter up to ${limit} characters`}
          </div>
        )}
        {children}
      </div>
    </div>
  );
};

export interface TextInputComponentProps extends InputComponentProps {
  children?: ReactNode;
  defaultValue?: string;
  textInputSubtype?: TextInputSubtype;
  width?: string;
  fluidWidth?: string;
  readOnly?: boolean;
  disabled?: boolean;
  newLineAccepted?: boolean;
  fieldPrefix?: string | null;
  limit?: number;
  limitWords?: boolean;
}

export default TextInput;
