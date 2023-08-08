import React from 'react';
import { InputType } from '../../types/InputType';
import { ValidationError } from '../../types/ValidationErrorType';
import Button, { ButtonProps } from './inputs/Button';
import ErrorBanner from '../display-errors/ErrorBanner';
import InputController from './InputController';

const QuestionPageLayout = ({
  formAction,
  questionTitle,
  pageCaption,
  questionHintText,
  fieldErrors,
  fieldName,
  inputType,
  buttons,
  csrfToken,
}: QuestionPageProps) => {
  if (typeof window !== 'undefined') {
    const errorSummary = window.document.getElementById('error-summary');
    // Only refocuses if the currently focused element is the root node
    if (errorSummary && window.document.activeElement?.nodeName === 'BODY') {
      errorSummary.focus();
    }
  }

  return (
    <>
      <ErrorBanner fieldErrors={fieldErrors} />

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <form
            action={formAction}
            method="post"
            noValidate
            data-testid="form-test-id"
          >
            {pageCaption && (
              <span
                className="govuk-caption-l"
                data-testid="question-page-caption"
                data-cy={`cy-pageCaption-${pageCaption}`}
              >
                {pageCaption}
              </span>
            )}

            <InputController
              questionTitle={questionTitle}
              questionHintText={questionHintText}
              fieldName={fieldName}
              fieldErrors={fieldErrors}
              inputType={inputType}
            />

            {csrfToken && (
              <input type="hidden" name="_csrf" value={csrfToken} />
            )}

            {buttons.length === 1 && <Button text={buttons[0].text} />}
            {buttons.length > 1 && (
              <div className="govuk-button-group">
                {buttons.map(({ text, isSecondary }) => (
                  <Button key={text} text={text} isSecondary={isSecondary} />
                ))}
              </div>
            )}
          </form>
        </div>
      </div>
    </>
  );
};

export interface QuestionPageProps {
  formAction: string;
  questionTitle: string;
  pageCaption?: string;
  questionHintText?: string | JSX.Element;
  fieldName: string;
  inputType: InputType;
  fieldErrors: ValidationError[];
  buttons: ButtonProps[];
  csrfToken: string;
}

export default QuestionPageLayout;
