import React, { ReactNode, RefObject } from 'react';
import { ValidationError } from '../../types/ValidationErrorType';
import ErrorBanner from '../display-errors/ErrorBanner';

const FlexibleQuestionPageLayout = ({
  children,
  formAction,
  pageCaption,
  fieldErrors,
  csrfToken,
  encType = 'application/x-www-form-urlencoded',
  sideBarContent,
  fullPageWidth,
  formRef,
}: FlexibleQuestionPageProps) => {
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
        <div
          className={
            fullPageWidth
              ? 'govuk-grid-column-full'
              : 'govuk-grid-column-two-thirds'
          }
        >
          <form
            action={formAction}
            method="post"
            noValidate
            data-testid="question-page-form"
            id="form-main-content"
            encType={encType}
            ref={formRef}
          >
            {pageCaption && (
              <span
                className="govuk-caption-l"
                data-testid="question-page-caption"
                data-cy={`cy-question-page-caption-${pageCaption}`}
              >
                {pageCaption}
              </span>
            )}
            {children}

            {csrfToken && (
              <input type="hidden" name="_csrf" value={csrfToken} />
            )}
          </form>
        </div>
        {!!sideBarContent && (
          <div className="govuk-grid-column-one-third">{sideBarContent}</div>
        )}
      </div>
    </>
  );
};

export interface FlexibleQuestionPageProps {
  children?: ReactNode;
  formAction: string;
  pageCaption?: string;
  fieldErrors: ValidationError[];
  csrfToken: string;
  encType?: string; //can be optional as forms default to 'application/x-www-form-urlencoded' but needs to be set to 'multipart/form-data' for file uploads
  sideBarContent?: JSX.Element;
  fullPageWidth?: boolean;
  formRef?: RefObject<HTMLFormElement>;
}

export default FlexibleQuestionPageLayout;
