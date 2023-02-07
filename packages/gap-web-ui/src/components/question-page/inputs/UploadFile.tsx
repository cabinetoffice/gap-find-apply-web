import React, { FC } from 'react';
import { ValidationError } from '../../../types';
import { FileType } from '../../../types/InputType';
import { ErrorMessage } from '../../display-errors';
export interface UploadProps {
  questionHintText?: string | JSX.Element;
  questionTitle: string;
  fieldErrors: ValidationError[];
  fieldName: string;
  uploadedFile?: FileType;
  deleteUrl?: string;
}

const UploadFile: FC<UploadProps> = ({
  questionHintText,
  questionTitle,
  fieldErrors,
  uploadedFile,
  fieldName,
  deleteUrl,
}) => {
  const hasError = fieldErrors.length > 0;

  return (
    <div
      className={`govuk-form-group${
        hasError ? ' govuk-form-group--error' : ''
      }`}
      data-testid="uploadFormDiv"
    >
      <h1 className="govuk-label-wrapper">
        <label className="govuk-label govuk-label--l" htmlFor={fieldName}>
          {questionTitle}
        </label>
      </h1>

      {questionHintText && (
        <div id={`${fieldName}-hint`} className="govuk-hint">
          {questionHintText}
        </div>
      )}

      <label className="govuk-label" aria-labelledby={fieldName}>
        {!uploadedFile ? 'Upload a file' : 'Uploaded File'}
      </label>
      {hasError && (
        <ErrorMessage fieldErrors={fieldErrors} fieldName={fieldName} />
      )}
      {!uploadedFile ? (
        <>
          <input
            className={`govuk-file-upload${
              hasError ? ' govuk-file-upload--error' : ''
            }`}
            id={fieldName}
            name="attachment" // will be the key in the body
            type="file"
            aria-describedby={`${!hasError ? fieldName : `${fieldName}-error`}`}
            data-testid="file-upload-input"
          />
          <input
            type="hidden"
            value="true"
            data-testid="pre-upload-hidden-input"
            name="pre-upload"
          />
        </>
      ) : (
        <>
          <dl className="govuk-summary-list" id={fieldName}>
            <div className="govuk-summary-list__row "></div>
            <div className="govuk-summary-list__row ">
              <dd className="govuk-summary-list__value">{uploadedFile.name}</dd>
              <dd className="govuk-summary-list__actions">
                <a className="govuk-link" href={deleteUrl}>
                  Remove File
                  <span className="govuk-visually-hidden">
                    {uploadedFile.name}
                  </span>
                </a>
              </dd>
            </div>
          </dl>
        </>
      )}
    </div>
  );
};

export default UploadFile;
