// TinyMCE generates its own toolbar and menu mark-up, which fails several WCAG
// checks raised in the DAC accessibility audit. TinyMCE offers no configuration
// for any of it, and its internal UI framework (alloy) re-applies the offending
// attributes after init, so the corrections here patch the rendered DOM and
// re-assert themselves through MutationObservers.

type RichTextEditor = {
  getContainer: () => HTMLElement | null;
  getBody: () => HTMLElement | null;
  focus: () => void;
  on: (name: string, callback: () => void) => void;
};

export type RichTextAccessibilityOptions = {
  fieldName: string;
  labelId: string;
  describedBy?: string;
  hasError?: boolean;
};

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), iframe, [tabindex]:not([tabindex="-1"])';

const TOOLBAR_NAME = 'Formatting';

const LISTBOX_NAME = 'Link suggestions';

// The class TinyMCE puts on the highlighted item of an open menu or popup.
const ACTIVE_OPTION_CLASS = 'tox-collection__item--active';

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

// Runs the fix once the editor's toolbar header is in the DOM. In inline mode
// TinyMCE attaches its UI from its own 'init' handler, which is registered
// after the React wrapper's, so the header can still be absent when the fixes
// first run and a plain early return would silently drop them.
const whenHeaderReady = (
  editor: RichTextEditor,
  apply: (header: HTMLElement, container: HTMLElement) => void
) => {
  const container = editor.getContainer();
  if (!container) return;

  const header = container.querySelector<HTMLElement>('.tox-editor-header');
  if (header) {
    apply(header, container);
    return;
  }

  const observer = new MutationObserver(() => {
    const rendered = container.querySelector<HTMLElement>('.tox-editor-header');
    if (!rendered) return;
    observer.disconnect();
    apply(rendered, container);
  });
  observer.observe(container, { childList: true, subtree: true });
  editor.on('remove', () => observer.disconnect());
};

// The editing area is a bare div: TinyMCE only adds contenteditable to it, and
// the React wrapper renders it with nothing but an id, so to a screen reader it
// has no role, no name and no description (DAC_Custom_Text_Area_01, 1.3.1 Info
// and Relationships, 4.1.2 Name, Role, Value). Naming it through ARIA is the
// only option available - a label's htmlFor associates with form controls only.
const makeEditableRegionAccessible = (
  editor: RichTextEditor,
  { labelId, describedBy, hasError }: RichTextAccessibilityOptions
) => {
  const body = editor.getBody();
  if (!body) return;

  body.setAttribute('role', 'textbox');
  body.setAttribute('aria-multiline', 'true');
  body.setAttribute('aria-labelledby', labelId);
  if (describedBy) body.setAttribute('aria-describedby', describedBy);
  if (hasError) body.setAttribute('aria-invalid', 'true');
};

// TinyMCE puts role="application" on its outer wrapper, which forces NVDA into
// application mode (DAC_Inaccessible_Content_01, DAC_Custom_Select_01). The
// toolbar controls are then absent from browse mode and from the elements list,
// so a user has no way of discovering that they exist, and the wrapper itself
// announces only as "Application". The toolbar follows the ARIA toolbar pattern
// and the editing area is exposed as editable in its own right, so neither
// relies on the role.
const removeApplicationRole = (editor: RichTextEditor) => {
  const container = editor.getContainer();
  if (container?.getAttribute('role') === 'application') {
    container.removeAttribute('role');
  }
};

// TinyMCE only exposes the toolbar via Alt+F10 and leaves every button at
// tabindex="-1", so keyboard/screen reader users cannot Tab to it from the
// page. Its internal UI framework (alloy) also re-applies these attributes
// after init, so a one-off change does not stick. This enforces the WAI-ARIA
// toolbar roving-tabindex pattern (exactly one button is a natural tab stop)
// and re-asserts it via a MutationObserver whenever TinyMCE resets it. Arrow
// key navigation across the single toolbar group is left to TinyMCE, so its
// own group attributes are deliberately not touched.
const makeToolbarKeyboardAccessible = (editor: RichTextEditor) =>
  whenHeaderReady(editor, (header, container) => {
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

    // TinyMCE names none of its toolbar groups, so with role="application" gone a
    // screen reader in browse mode announces only "toolbar" as the cursor enters
    // it, giving no clue what the controls are for (4.1.2 Name, Role, Value).
    const ensureToolbarName = () => {
      header
        .querySelectorAll<HTMLElement>('[role="toolbar"]')
        .forEach((toolbar) => {
          if (toolbar.getAttribute('aria-label') !== TOOLBAR_NAME) {
            toolbar.setAttribute('aria-label', TOOLBAR_NAME);
          }
        });
    };

    const applyToolbarFixes = () => {
      ensureToolbarName();
      ensureEntryButton();
    };

    applyToolbarFixes();

    const observer = new MutationObserver(applyToolbarFixes);
    observer.observe(header, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['tabindex'],
    });
    editor.on('remove', () => observer.disconnect());

    // Roving tabindex: the tab stop follows the most recently focused button.
    header.addEventListener('focusin', (event) => {
      const focused = (
        event.target as HTMLElement | null
      )?.closest<HTMLElement>('.tox-tbtn');
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
  });

// The block-format ("Paragraph"/"Heading n") control is a TinyMCE bespoke
// select whose generated ARIA fails several WCAG checks (DAC_Custom_Select_01):
// the button's accessible name does not match its visible label; the popup nests
// a role="listbox" around a role="menu"; that menu has no accessible name; and
// each option carries an aria-selected attribute that is invalid on
// role="menuitemcheckbox". TinyMCE re-applies this markup (on NodeChange, and
// afresh every time the menu opens), so the corrections are re-asserted via
// MutationObservers rather than set once.
const makeCustomSelectAccessible = (
  editor: RichTextEditor,
  fieldName: string
) =>
  whenHeaderReady(editor, (header) => {
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
        .querySelectorAll<HTMLElement>(
          '[role="menuitemcheckbox"][aria-selected]'
        )
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
  });

// Alloy, TinyMCE's UI framework, gives every control it builds tabindex="-1"
// and then simulates Tab within the dialog itself, so the link dialog's Close
// button is absent from the page's own tab order (DAC_Not_Keyboard_Navigable_01,
// 2.1.1 Keyboard). Removing the attribute restores it, since a <button> is
// focusable in its own right. Only buttons alloy has marked as tab stops are
// touched: it marks custom widgets too, and those are not focusable without the
// tabindex. A dialog is built afresh each time it opens, so this runs per open.
const makeDialogsKeyboardAccessible = (editor: RichTextEditor) => {
  editor.on('OpenWindow', () => {
    document
      .querySelectorAll<HTMLElement>(
        '.tox-dialog button[data-alloy-tabstop="true"][tabindex="-1"]'
      )
      .forEach((button) => button.removeAttribute('tabindex'));
  });
};

// TinyMCE renders a dialog's title as a plain div, so there is no heading to
// reach with a screen reader's heading shortcut and nothing to mark where the
// dialog's content begins (DAC_Visual_Headings_01, 1.3.1 Info and
// Relationships). The div already supplies the dialog's accessible name; this
// adds the level two heading DAC asked for on top of it. An untitled dialog
// renders the same div empty and hidden, and is skipped so that no empty
// heading is exposed.
const makeDialogTitlesHeadings = (editor: RichTextEditor) => {
  editor.on('OpenWindow', () => {
    document
      .querySelectorAll<HTMLElement>('.tox-dialog__title')
      .forEach((title) => {
        if (!title.textContent?.trim()) return;
        title.setAttribute('role', 'heading');
        title.setAttribute('aria-level', '2');
      });
  });
};

// The link dialog's URL field is a combobox, but TinyMCE fills its popup with a
// menu: a role="menu" nested inside the role="listbox" popup, holding the
// suggestions as role="menuitem". Two conflicting roles means the suggestions
// are announced as nothing at all (DAC_Custom_Combobox_01, 1.3.1 Info and
// Relationships, 4.1.2 Name, Role, Value). This reshapes the popup into the
// ARIA combobox pattern DAC pointed at: a named listbox of options, with the
// highlighted one carried by aria-activedescendant. TinyMCE already sets that
// attribute itself when it highlights an item, but only when the item has an
// id, and it never gives them one - so the ids below also repair its own code.
const makeUrlComboboxAccessible = (
  editor: RichTextEditor,
  fieldName: string
) => {
  const fixCombobox = () => {
    const input = document.querySelector<HTMLElement>(
      '.tox-dialog [role="combobox"]'
    );
    if (!input) return;

    // A combobox pops up a listbox; aria-haspopup="true" claims a menu.
    if (input.getAttribute('aria-haspopup') !== 'listbox') {
      input.setAttribute('aria-haspopup', 'listbox');
    }

    const listbox = document.querySelector<HTMLElement>(
      '.tox-dialog__popups[role="listbox"]'
    );
    if (!listbox) return;

    if (listbox.getAttribute('aria-label') !== LISTBOX_NAME) {
      listbox.setAttribute('aria-label', LISTBOX_NAME);
    }

    // A listbox may only own options, so the menu and group wrappers TinyMCE
    // nests in between are taken out of the accessibility tree.
    listbox
      .querySelectorAll<HTMLElement>(
        '.tox-tiered-menu, [role="menu"], .tox-collection__group'
      )
      .forEach((wrapper) => {
        if (wrapper.getAttribute('role') !== 'presentation') {
          wrapper.setAttribute('role', 'presentation');
        }
      });

    let activeOptionId = '';
    listbox
      .querySelectorAll<HTMLElement>('.tox-collection__item')
      .forEach((option, index) => {
        if (option.getAttribute('role') !== 'option') {
          option.setAttribute('role', 'option');
        }
        if (!option.id) option.id = `${fieldName}-link-suggestion-${index}`;

        const selected = option.classList.contains(ACTIVE_OPTION_CLASS);
        if (selected) activeOptionId = option.id;
        if (option.getAttribute('aria-selected') !== String(selected)) {
          option.setAttribute('aria-selected', String(selected));
        }
      });

    if (
      activeOptionId &&
      input.getAttribute('aria-activedescendant') !== activeOptionId
    ) {
      input.setAttribute('aria-activedescendant', activeOptionId);
    }
  };

  // TinyMCE builds and discards the popup as the field is typed in, and marks
  // the highlighted suggestion with a class, so the corrections are re-applied
  // on every change for as long as a dialog is open.
  const observer = new MutationObserver(fixCombobox);

  editor.on('OpenWindow', () => {
    fixCombobox();
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'aria-expanded'],
    });
  });

  editor.on('CloseWindow', () => observer.disconnect());
  editor.on('remove', () => observer.disconnect());
};

const applyRichTextAccessibilityFixes = (
  editor: RichTextEditor,
  options: RichTextAccessibilityOptions
) => {
  removeApplicationRole(editor);
  makeEditableRegionAccessible(editor, options);
  makeToolbarKeyboardAccessible(editor);
  makeCustomSelectAccessible(editor, options.fieldName);
  makeDialogsKeyboardAccessible(editor);
  makeDialogTitlesHeadings(editor);
  makeUrlComboboxAccessible(editor, options.fieldName);
};

export default applyRichTextAccessibilityFixes;
