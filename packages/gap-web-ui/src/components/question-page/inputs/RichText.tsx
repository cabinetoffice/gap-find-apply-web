import { Editor } from '@tinymce/tinymce-react';
import React from 'react';
import ErrorMessage from '../../display-errors/ErrorMessage';
import applyRichTextAccessibilityFixes from './richTextAccessibility';
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
  isJsEnabled,
  multipleQuestionPage = true,
  applicationHost,
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

  const labelId = `${fieldName}-label`;
  const hintId = `${fieldName}-hint`;
  const toolbarId = `${fieldName}-toolbar`;
  const describedBy = [
    questionHintText ? hintId : undefined,
    hasError ? `${fieldName}-error` : undefined,
  ]
    .filter(Boolean)
    .join(' ');

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
        {/* The editing area is a div rather than a form control, so it is named
            with aria-labelledby - htmlFor would associate with nothing. */}
        <span className={labelClasses} id={labelId}>
          {questionTitle}
        </span>
      </TitleTag>

      {questionHintText && (
        <div
          id={hintId}
          className={`govuk-hint ${newLineClass}`}
          data-cy={`cy-${fieldName}-question-hint`}
        >
          {questionHintText}
        </div>
      )}

      <ErrorMessage fieldErrors={fieldErrors} fieldName={fieldName} />

      <div
        className={`gap-rich-text${hasError ? ' gap-rich-text--error' : ''}`}
        data-testid="rich-text-editor"
      >
        {/* TinyMCE renders its toolbar into this container, which keeps the
            toolbar ahead of the editing area in the DOM and in the tab order. */}
        <div id={toolbarId} className="gap-rich-text__toolbar" />

        <Editor
          tinymceScriptSrc={applicationHost + '/tinymce/tinymce.min.js'}
          // Inline mode edits an element in the page instead of a
          // contenteditable body inside an iframe, which is what stopped the
          // editing area announcing as a text box (DAC_Custom_Text_Area_01).
          inline
          init={{
            menubar: false,
            statusbar: false,
            plugins: 'lists | link',
            toolbar: 'blocks bold italic bullist numlist link',
            block_formats:
              'Paragraph=p; Heading 2=h2; Heading 3=h3; Heading 4=h4; Heading 5=h5; Heading 6=h6',
            link_target_list: false,
            toolbar_persist: true,
            fixed_toolbar_container: `#${toolbarId}`,
          }}
          disabled={disabled}
          value={value}
          onEditorChange={setValue}
          onInit={(_evt, editor) =>
            applyRichTextAccessibilityFixes(editor, {
              fieldName,
              labelId,
              describedBy,
              hasError,
            })
          }
          initialValue={defaultValue}
          id={fieldName}
        />
      </div>

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
  isJsEnabled: boolean;
  applicationHost: string;
}

export default RichText;
