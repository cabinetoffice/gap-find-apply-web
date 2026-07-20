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

// The block-format ("Paragraph"/"Heading n") control is a TinyMCE bespoke
// select whose generated ARIA fails several WCAG checks (DAC_Custom_Select_01):
// the button's accessible name does not match its visible label; the popup nests
// a role="listbox" around a role="menu"; that menu has no accessible name; and
// each option carries an aria-selected attribute that is invalid on
// role="menuitemcheckbox". TinyMCE re-applies this markup (on NodeChange, and
// afresh every time the menu opens), so the corrections are re-asserted via
// MutationObservers rather than set once.
const makeCustomSelectAccessible = (
  editor: ToolbarEditor,
  fieldName: string
) => {
  const container = editor.getContainer();
  const header = container?.querySelector<HTMLElement>('.tox-editor-header');
  if (!container || !header) return;

  const observers: MutationObserver[] = [];

  // Give the button an accessible name that contains its visible label and
  // describes its purpose, e.g. "Styling: Paragraph" (2.5.3 Label in Name,
  // 2.4.6 Headings and Labels). TinyMCE resets this on selection changes and
  // can replace the button node entirely, so re-query the button live on every
  // change and observe the (stable) header rather than holding a reference.
  const applyAccessibleName = () => {
    const button = header.querySelector<HTMLElement>('.tox-tbtn--bespoke');
    const label = button
      ?.querySelector<HTMLElement>('.tox-tbtn__select-label')
      ?.textContent?.trim();
    if (!button || !label) return;
    const name = `Styling: ${label}`;
    if (button.getAttribute('aria-label') !== name) {
      button.setAttribute('aria-label', name);
    }
    if (button.getAttribute('title') !== name) {
      button.setAttribute('title', name);
    }
  };
  applyAccessibleName();
  const nameObserver = new MutationObserver(applyAccessibleName);
  nameObserver.observe(header, {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: true,
    attributeFilter: ['aria-label', 'title'],
  });
  observers.push(nameObserver);

  // Correct the popup menu markup while this editor's select is open (1.3.1
  // Info and Relationships, 4.1.2 Name, Role, Value).
  const menuId = `${fieldName}-stylings-menu`;
  const fixStylingsMenu = () => {
    const expanded = header.querySelector<HTMLElement>(
      '.tox-tbtn--bespoke[aria-expanded="true"]'
    );
    if (!expanded) return;

    const menu = document.querySelector<HTMLElement>(
      '.tox-tinymce-aux [role="menu"]'
    );
    if (!menu) return;

    // One clear role: drop the redundant listbox wrapping the menu.
    menu.closest<HTMLElement>('[role="listbox"]')?.removeAttribute('role');

    // Give the menu an id and an accessible name, and reference it from the
    // button so aria-controls points at the surviving role="menu".
    if (menu.id !== menuId) menu.id = menuId;
    if (menu.getAttribute('aria-label') !== 'Stylings') {
      menu.setAttribute('aria-label', 'Stylings');
    }
    if (expanded.getAttribute('aria-controls') !== menuId) {
      expanded.setAttribute('aria-controls', menuId);
    }

    // aria-selected is not allowed on role="menuitemcheckbox"; aria-checked
    // already conveys the current selection.
    menu
      .querySelectorAll<HTMLElement>('[role="menuitemcheckbox"][aria-selected]')
      .forEach((item) => item.removeAttribute('aria-selected'));
  };

  const menuObserver = new MutationObserver(fixStylingsMenu);
  menuObserver.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['aria-expanded', 'aria-selected'],
  });
  observers.push(menuObserver);

  editor.on('remove', () =>
    observers.forEach((observer) => observer.disconnect())
  );
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
        onInit={(_evt, editor) => {
          makeToolbarKeyboardAccessible(editor, accessibleName);
          makeCustomSelectAccessible(editor, fieldName);
        }}
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
