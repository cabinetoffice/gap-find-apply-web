import { Editor } from '@tinymce/tinymce-react';
import React from 'react';
import ErrorMessage from '../../display-errors/ErrorMessage';
import TextArea, { TextAreaProps } from './TextArea';

const RichText = ({
  questionTitle,
  titleSize = 'l',
  questionHintText,
  fieldName,
  fieldErrors,
  disabled = false,
  TitleTag = 'h1',
  newLineAccepted = false,
  defaultValue = '',
  value,
  setValue,
  apiKey,
  isJsEnabled,
  multipleQuestionPage = true,
}: RichTextProps) => {
  if (!isJsEnabled) {
    return (
      <>
        <TextArea
          questionTitle={questionTitle}
          titleSize={titleSize}
          questionHintText={questionHintText}
          fieldName={fieldName}
          fieldErrors={fieldErrors}
          defaultValue={defaultValue}
          disabled={disabled}
          TitleTag={TitleTag}
          multipleQuestionPage={multipleQuestionPage}
        />
        <input
          value="true"
          data-testid="jsDisabled"
          name="jsDisabled"
          type="hidden"
        />
      </>
    );
  }

  const hasError = fieldErrors.some((fieldError) =>
    fieldError.fieldName.startsWith(fieldName)
  );
  const newLineClass = newLineAccepted ? `gap-new-line` : '';
  const labelClasses = multipleQuestionPage
    ? `govuk-label govuk-label--${titleSize}`
    : 'govuk-heading-l';
  return (
    <div
      className={`govuk-form-group${
        hasError ? ' govuk-form-group--error' : ''
      }`}
      data-testid="rich-text-component"
    >
      <TitleTag
        className="govuk-label-wrapper"
        data-cy={`cy-${fieldName}-question-title`}
      >
        <label className={labelClasses} htmlFor={fieldName}>
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

      <ErrorMessage fieldErrors={fieldErrors} fieldName={fieldName} />

      <Editor
        apiKey={apiKey}
        init={{
          menubar: false,
          statusbar: false,
          plugins: 'lists | link',
          toolbar: 'blocks | bold italic | bullist numlist | link',
          block_formats:
            'Paragraph=p; Heading 2=h2; Heading 3=h3; Heading 4=h4; Heading 5=h5; Heading 6=h6',
        }}
        disabled={disabled}
        value={value}
        onEditorChange={setValue}
        initialValue={defaultValue}
        id={fieldName}
      />

      <label
        className="govuk-label govuk-visually-hidden"
        htmlFor="hidden-input"
        hidden
        aria-hidden
      >
        Hidden input
      </label>

      <input
        value={value}
        name={fieldName}
        id="hidden-input"
        hidden
        className="govuk-visually-hidden"
        readOnly
      />
    </div>
  );
};

export interface RichTextProps extends TextAreaProps {
  value: string;
  setValue: (text: string) => void;
  apiKey: string;
  isJsEnabled: boolean;
}

export default RichText;
