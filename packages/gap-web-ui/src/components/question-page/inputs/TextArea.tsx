import React from 'react';
import ErrorMessage from '../../display-errors/ErrorMessage';
import Details from '../Details';
import { InputComponentProps } from './InputComponentProps';

const TextArea = ({
  questionTitle,
  titleSize = 'l',
  questionHintText,
  fieldName,
  fieldErrors,
  defaultValue = '',
  limit,
  limitWords = false,
  rows = 5,
  disabled = false,
  TitleTag = 'h1',
  newLineAccepted = false,
  multipleQuestionPage = true,
  exampleText,
}: TextAreaProps) => {
  const hasError = fieldErrors.some((fieldError) =>
    fieldError.fieldName.startsWith(fieldName)
  );

  const newLineClass = newLineAccepted ? `gap-new-line` : '';
  const labelClasses = multipleQuestionPage
    ? `govuk-label govuk-label--${titleSize}`
    : 'govuk-heading-l';

  return (
    <div
      className="govuk-character-count"
      data-module="govuk-character-count"
      data-maxlength={limitWords ? undefined : limit}
      data-maxwords={limitWords ? limit : undefined}
    >
      <div
        className={`govuk-form-group${
          hasError ? ' govuk-form-group--error' : ''
        }`}
        data-testid="text-area-component"
      >
        <TitleTag className="govuk-label-wrapper">
          <label
            className={labelClasses}
            htmlFor={fieldName}
            data-testid={`${questionTitle?.replace(' ', '-')}-label`}
            data-cy={`cy-${fieldName}-question-title`}
          >
            {questionTitle}
          </label>
        </TitleTag>

        {questionHintText && (
          <div
            id="description-hint"
            className={`govuk-hint ${newLineClass}`}
            data-cy={`cy-${fieldName}-question-hint`}
          >
            {questionHintText}
          </div>
        )}

        {exampleText && (
          <Details title={exampleText.title} text={exampleText.text} />
        )}

        <ErrorMessage fieldErrors={fieldErrors} fieldName={fieldName} />

        <textarea
          className={`govuk-textarea govuk-js-character-count ${
            hasError ? 'govuk-textarea--error' : ''
          }`}
          id={fieldName}
          name={fieldName}
          rows={rows}
          aria-describedby={`${fieldName}-info description-hint`}
          defaultValue={defaultValue}
          disabled={disabled}
          data-cy={`cy-${fieldName}-text-area`}
        />
      </div>

      {limit && (
        <div
          id={`${fieldName}-info`}
          className="govuk-hint govuk-character-count__message"
          data-testid="character-limit-div"
        >
          {/* Written as full sentences for accessibility */}
          {limitWords
            ? `You can enter up to ${limit} words`
            : `You can enter up to ${limit} characters`}
        </div>
      )}
    </div>
  );
};

export interface TextAreaProps extends InputComponentProps {
  defaultValue?: string;
  limit?: number;
  limitWords?: boolean;
  rows?: number;
  disabled?: boolean;
  TitleTag?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  newLineAccepted?: boolean;
}

export default TextArea;
