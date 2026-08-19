import '@testing-library/jest-dom';
import applyRichTextAccessibilityFixes, {
  RichTextAccessibilityOptions,
} from './richTextAccessibility';

// jsdom has no layout, so offsetParent is always null and every candidate would
// be filtered out of the "previous focusable element" search.
beforeAll(() => {
  Object.defineProperty(HTMLElement.prototype, 'offsetParent', {
    configurable: true,
    get(this: HTMLElement) {
      return this.parentElement;
    },
  });
});

// MutationObserver callbacks are delivered asynchronously, so anything that
// asserts on a re-applied fix has to wait a tick first.
const flushObservers = () => new Promise((resolve) => setTimeout(resolve, 0));

// Mirrors what TinyMCE renders in inline mode: the toolbar goes in the fixed
// container we provide, and the editing area is an element in the page rather
// than an iframe.
const buildEditorDom = () => {
  document.body.innerHTML = `
    <button id="preceding-control">Back</button>
    <div class="gap-rich-text">
      <div id="grantEligibilityTab-toolbar" class="gap-rich-text__toolbar">
        <div class="tox tox-tinymce tox-tinymce-inline" role="application">
          <div class="tox-editor-header">
            <div class="tox-toolbar__primary" role="group">
              <div class="tox-toolbar__group" role="toolbar">
                <button
                  class="tox-tbtn tox-tbtn--select tox-tbtn--bespoke"
                  aria-label="Blocks"
                  title="Blocks"
                  aria-expanded="false"
                >
                  <span class="tox-tbtn__select-label">Paragraph</span>
                </button>
                <button class="tox-tbtn" aria-label="Bold" title="Bold"></button>
                <button class="tox-tbtn" aria-label="Italic" title="Italic"></button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div
        id="grantEligibilityTab"
        class="mce-content-body"
        contenteditable="true"
      ></div>
    </div>
  `;
  return document.querySelector<HTMLElement>('.tox-tinymce')!;
};

const getEditableRegion = () =>
  document.querySelector<HTMLElement>('.mce-content-body');

const openStylingsMenu = () => {
  document
    .querySelector('.tox-tbtn--bespoke')!
    .setAttribute('aria-expanded', 'true');

  const aux = document.createElement('div');
  aux.className = 'tox tox-silver-sink tox-tinymce-aux';
  aux.innerHTML = `
    <div id="aria-controls_generated" role="listbox">
      <div class="tox-tiered-menu">
        <div role="menu" class="tox-menu tox-collection">
          <div class="tox-collection__group">
            <div role="menuitemcheckbox" aria-checked="true" aria-selected="true" title="Paragraph"></div>
            <div role="menuitemcheckbox" aria-checked="false" aria-selected="false" title="Heading 2"></div>
          </div>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(aux);
};

// Both fixes register their own 'remove' handler, so these are collected rather
// than overwritten.
const createEditor = (container: HTMLElement) => {
  const handlers: Record<string, (() => void)[]> = {};
  return {
    getContainer: () => container,
    getBody: () => getEditableRegion(),
    focus: jest.fn(),
    on: (name: string, callback: () => void) => {
      handlers[name] = [...(handlers[name] ?? []), callback];
    },
    emit: (name: string) =>
      (handlers[name] ?? []).forEach((callback) => callback()),
  };
};

const getButtons = () =>
  Array.from(document.querySelectorAll<HTMLElement>('.tox-tbtn'));

const getTabIndexes = () =>
  getButtons().map((button) => button.getAttribute('tabindex'));

let activeEditors: ReturnType<typeof createEditor>[] = [];

const fixEditor = (
  container: HTMLElement,
  options: Partial<RichTextAccessibilityOptions> = {}
) => {
  const editor = createEditor(container);
  activeEditors.push(editor);
  applyRichTextAccessibilityFixes(editor, {
    fieldName: 'grantEligibilityTab',
    labelId: 'grantEligibilityTab-label',
    describedBy: 'grantEligibilityTab-hint',
    ...options,
  });
  return editor;
};

const applyFixes = () => fixEditor(buildEditorDom());

// The menu observer watches document.body, which outlives the markup each test
// builds, so every editor is torn down the way TinyMCE would tear it down.
afterEach(() => {
  activeEditors.forEach((editor) => editor.emit('remove'));
  activeEditors = [];
  document.body.innerHTML = '';
});

describe('Rich text accessibility fixes', () => {
  describe('Application role (DAC_Inaccessible_Content_01)', () => {
    it('Removes role="application" so the toolbar is reachable in browse mode', () => {
      applyFixes();

      expect(document.querySelector('.tox-tinymce')!.hasAttribute('role')).toBe(
        false
      );
    });

    it('Leaves any other role on the container alone', () => {
      const container = buildEditorDom();
      container.setAttribute('role', 'group');

      fixEditor(container);

      expect(container.getAttribute('role')).toBe('group');
    });
  });

  describe('Toolbar keyboard access (DAC_Inaccessible_Content_01)', () => {
    it('Makes the first toolbar button the only tab stop', () => {
      applyFixes();

      expect(getTabIndexes()).toEqual(['0', '-1', '-1']);
    });

    it('Moves the tab stop to whichever button was last focused', () => {
      applyFixes();

      getButtons()[2].dispatchEvent(
        new FocusEvent('focusin', { bubbles: true })
      );

      expect(getTabIndexes()).toEqual(['-1', '-1', '0']);
    });

    it('Restores a tab stop when TinyMCE resets every button to -1', async () => {
      applyFixes();
      getButtons().forEach((button) => button.setAttribute('tabindex', '-1'));

      await flushObservers();

      expect(getTabIndexes()).toEqual(['0', '-1', '-1']);
    });

    it('Moves focus into the editor body on Tab', () => {
      const editor = applyFixes();

      getButtons()[0].dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Tab', bubbles: true })
      );

      expect(editor.focus).toHaveBeenCalled();
    });

    it('Moves focus back to the preceding control on Shift+Tab', () => {
      const editor = applyFixes();

      getButtons()[0].dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'Tab',
          shiftKey: true,
          bubbles: true,
        })
      );

      expect(document.activeElement?.id).toBe('preceding-control');
      expect(editor.focus).not.toHaveBeenCalled();
    });

    it('Names the toolbar so its purpose is clear in browse mode', () => {
      applyFixes();

      expect(document.querySelector('[role="toolbar"]')).toHaveAttribute(
        'aria-label',
        'Formatting'
      );
    });

    it('Restores the toolbar name when TinyMCE re-renders the toolbar', async () => {
      applyFixes();

      document.querySelector('.tox-toolbar__primary')!.innerHTML = `
        <div class="tox-toolbar__group" role="toolbar">
          <button class="tox-tbtn" aria-label="Bold" title="Bold"></button>
        </div>
      `;
      await flushObservers();

      expect(document.querySelector('[role="toolbar"]')).toHaveAttribute(
        'aria-label',
        'Formatting'
      );
    });

    it('Applies the fixes when TinyMCE attaches the toolbar after init', async () => {
      document.body.innerHTML = `
        <button id="preceding-control">Back</button>
        <div class="tox tox-tinymce tox-tinymce-inline" role="application"></div>
      `;
      const container = document.querySelector<HTMLElement>('.tox-tinymce')!;
      fixEditor(container);

      container.innerHTML = `
        <div class="tox-editor-header">
          <div class="tox-toolbar__group" role="toolbar">
            <button class="tox-tbtn" aria-label="Bold" title="Bold"></button>
          </div>
        </div>
      `;
      await flushObservers();

      expect(document.querySelector('[role="toolbar"]')).toHaveAttribute(
        'aria-label',
        'Formatting'
      );
      expect(getTabIndexes()).toEqual(['0']);
    });
  });

  describe('Editing area (DAC_Custom_Text_Area_01)', () => {
    it('Exposes the editing area as a multi-line text box', () => {
      applyFixes();

      expect(getEditableRegion()).toHaveAttribute('role', 'textbox');
      expect(getEditableRegion()).toHaveAttribute('aria-multiline', 'true');
    });

    it('Names the editing area from the visible question title', () => {
      applyFixes();

      expect(getEditableRegion()).toHaveAttribute(
        'aria-labelledby',
        'grantEligibilityTab-label'
      );
    });

    it('Describes the editing area with the hint', () => {
      applyFixes();

      expect(getEditableRegion()).toHaveAttribute(
        'aria-describedby',
        'grantEligibilityTab-hint'
      );
    });

    it('Marks the editing area invalid when the question is in error', () => {
      fixEditor(buildEditorDom(), {
        describedBy: 'grantEligibilityTab-hint grantEligibilityTab-error',
        hasError: true,
      });

      expect(getEditableRegion()).toHaveAttribute('aria-invalid', 'true');
      expect(getEditableRegion()).toHaveAttribute(
        'aria-describedby',
        'grantEligibilityTab-hint grantEligibilityTab-error'
      );
    });

    it('Leaves a valid editing area without aria-invalid', () => {
      applyFixes();

      expect(getEditableRegion()).not.toHaveAttribute('aria-invalid');
    });
  });

  describe('Block format select (DAC_Custom_Select_01)', () => {
    it('Gives the button an accessible name containing its visible label', () => {
      applyFixes();

      const button = document.querySelector('.tox-tbtn--bespoke')!;
      expect(button).toHaveAttribute('aria-label', 'Styling: Paragraph');
      expect(button).toHaveAttribute('title', 'Styling: Paragraph');
    });

    it('Keeps the accessible name in step with the current selection', async () => {
      applyFixes();

      document.querySelector('.tox-tbtn__select-label')!.textContent =
        'Heading 2';
      await flushObservers();

      expect(document.querySelector('.tox-tbtn--bespoke')).toHaveAttribute(
        'aria-label',
        'Styling: Heading 2'
      );
    });

    it('Corrects the popup markup when the menu opens', async () => {
      applyFixes();

      openStylingsMenu();
      await flushObservers();

      const menu = document.querySelector('[role="menu"]')!;
      expect(document.querySelector('[role="listbox"]')).toBeNull();
      expect(menu).toHaveAttribute('id', 'grantEligibilityTab-stylings-menu');
      expect(menu).toHaveAttribute('aria-label', 'Stylings');
      expect(document.querySelector('.tox-tbtn--bespoke')).toHaveAttribute(
        'aria-controls',
        'grantEligibilityTab-stylings-menu'
      );
      expect(
        document.querySelectorAll('[role="menuitemcheckbox"][aria-selected]')
      ).toHaveLength(0);
      expect(
        document.querySelectorAll('[role="menuitemcheckbox"][aria-checked]')
      ).toHaveLength(2);
    });
  });

  it('Stops observing when the editor is removed', async () => {
    const editor = applyFixes();

    editor.emit('remove');
    getButtons().forEach((button) => button.setAttribute('tabindex', '-1'));
    await flushObservers();

    expect(getTabIndexes()).toEqual(['-1', '-1', '-1']);
  });
});
