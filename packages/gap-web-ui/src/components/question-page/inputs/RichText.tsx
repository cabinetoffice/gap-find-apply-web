import { Editor } from '@tinymce/tinymce-react';
import React from 'react';
import ErrorMessage from '../../display-errors/ErrorMessage';
import TextArea, { TextAreaProps } from './TextArea';

type ToolbarEditor = {
  getContainer: () => HTMLElement | null;
  focus: () => void;
  on: (name: string, callback: () => void) => void;
};

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), iframe, [tabindex]:not([tabindex="-1"])';

// Moves focus to the last focusable element in the page that appears before the
// given boundary element - used to leave the toolbar backwards on Shift+Tab.
const focusElementBefore = (boundary: HTMLElement) => {
  const focusables = Array.from(
    document.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
  ).filter((el) => !boundary.contains(el) && el.offsetParent !== null);
  let previous: HTMLElement | null = null;
  for (const element of focusables) {
    if (
      boundary.compareDocumentPosition(element) &
      Node.DOCUMENT_POSITION_PRECEDING
    ) {
      previous = element;
    }
  }
  previous?.focus();
};

// TinyMCE only exposes the toolbar via Alt+F10 and leaves every button at
// tabindex="-1", so keyboard/screen reader users cannot Tab to it from the
// page. Its internal UI framework (alloy) also re-applies these attributes
// after init, so a one-off change does not stick. This enforces the WAI-ARIA
// toolbar roving-tabindex pattern (exactly one button is a natural tab stop)
// and re-asserts it via a MutationObserver whenever TinyMCE resets it. Arrow
// key navigation across the single toolbar group is left to TinyMCE, so its
// own group attributes are deliberately not touched.
const makeToolbarKeyboardAccessible = (
  editor: ToolbarEditor,
  accessibleName?: string
) => {
  const container = editor.getContainer();
  const header = container?.querySelector<HTMLElement>('.tox-editor-header');
  if (!container || !header) return;

  const getButtons = () =>
    Array.from(header.querySelectorAll<HTMLElement>('.tox-tbtn'));

  const setEntryButton = (active: Element) => {
    getButtons().forEach((button) => {
      button.setAttribute('tabindex', button === active ? '0' : '-1');
    });
  };

  // Guarantee a single tab stop exists. Only write when one is missing, so the
  // observer below cannot loop reacting to its own mutations.
  const ensureEntryButton = () => {
    const buttons = getButtons();
    if (buttons.length === 0) return;
    const hasEntry = buttons.some(
      (button) => button.getAttribute('tabindex') === '0'
    );
    if (!hasEntry) setEntryButton(buttons[0]);
  };

  ensureEntryButton();

  const observer = new MutationObserver(ensureEntryButton);
  observer.observe(header, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['tabindex'],
  });
  editor.on('remove', () => observer.disconnect());

  // Roving tabindex: the tab stop follows the most recently focused button.
  header.addEventListener('focusin', (event) => {
    const focused = (event.target as HTMLElement | null)?.closest<HTMLElement>(
      '.tox-tbtn'
    );
    if (focused) setEntryButton(focused);
  });

  // The toolbar is a single tab stop: Tab / Shift+Tab must move focus out of it
  // (into the editor body, or back to the previous control) rather than being
  // trapped by TinyMCE, which by default only lets you leave with Escape.
  // Captured so this runs before TinyMCE's own toolbar key handling.
  header.addEventListener(
    'keydown',
    (event) => {
      if (event.key !== 'Tab') return;
      const target = event.target as HTMLElement | null;
      if (!target || !header.contains(target)) return;
      event.preventDefault();
      event.stopPropagation();
      if (event.shiftKey) {
        focusElementBefore(container);
      } else {
        editor.focus();
      }
    },
    true
  );

  if (accessibleName) {
    const iframe = container.querySelector<HTMLIFrameElement>('iframe');
    iframe?.setAttribute('title', accessibleName);
  }
};

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
  const accessibleName =
    typeof questionTitle === 'string' ? questionTitle : undefined;
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
        tinymceScriptSrc={applicationHost + '/tinymce/tinymce.min.js'}
        init={{
          menubar: false,
          statusbar: false,
          plugins: 'lists | link',
          toolbar: 'blocks bold italic bullist numlist link',
          block_formats:
            'Paragraph=p; Heading 2=h2; Heading 3=h3; Heading 4=h4; Heading 5=h5; Heading 6=h6',
          link_target_list: false,
        }}
        disabled={disabled}
        value={value}
        onEditorChange={setValue}
        onInit={(_evt, editor) =>
          makeToolbarKeyboardAccessible(editor, accessibleName)
        }
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
  isJsEnabled: boolean;
  applicationHost: string;
}

export default RichText;
