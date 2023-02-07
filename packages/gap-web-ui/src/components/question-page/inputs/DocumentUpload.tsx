import React from 'react';
import { ValidationError } from '../../../types';
import { ErrorMessage } from '../../display-errors';

const DocumentUpload = ({
  questionTitle,
  titleSize = 'l',
  questionHintText,
  fieldName,
  fieldErrors,
  disabled = false,
}: DocumentUploadProps) => {
  const hasError = fieldErrors.some((fieldError) =>
    fieldError.fieldName.startsWith(fieldName)
  );

  return (
    <div
      className={`govuk-form-group${
        hasError ? ' govuk-form-group--error' : ''
      }`}
      data-testid="document-upload"
    >
      <h1 className="govuk-label-wrapper">
        <label
          className={`govuk-label govuk-label--${titleSize}`}
          htmlFor={fieldName}
          data-cy={`cy-${fieldName}-question-title`}
        >
          {questionTitle}
        </label>
      </h1>

      {questionHintText && (
        <div
          id={`${fieldName}-hint`}
          className="govuk-hint"
          data-cy={`cy-${fieldName}-question-hint`}
        >
          {questionHintText}
        </div>
      )}

      <label className="govuk-label govuk-!-margin-top-8" htmlFor={fieldName}>
        Upload a file (all documents except .xls and .exe)
      </label>

      <ErrorMessage fieldErrors={fieldErrors} fieldName={fieldName} />

      <input
        className={`govuk-file-upload${
          hasError ? ' govuk-file-upload--error' : ''
        }`}
        aria-describedby={`${fieldName}-hint`}
        id={fieldName}
        name={fieldName}
        type="file"
        disabled={disabled}
        data-testid={`document-upload-input-${fieldName}`}
      />

      <div
        id={`${fieldName}-hint`}
        className="govuk-hint govuk-!-margin-top-8"
        data-cy="cy_questionPreview-documentUploadHintText"
      >
        This might take a few minutes if you are uploading a large file. Once
        your file has been uploaded it will be listed on the screen.
      </div>
    </div>
  );
};

type DocumentUploadProps = {
  questionTitle: string;
  titleSize?: 's' | 'm' | 'l' | 'xl';
  questionHintText?: string | JSX.Element;
  fieldName: string;
  fieldErrors: ValidationError[];
  disabled?: boolean;
};

export default DocumentUpload;
