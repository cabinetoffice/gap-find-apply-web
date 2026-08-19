# Accessibility testing

## Rich text editor: screen reader pass

### Why this pass exists

The rich text editor is TinyMCE, whose toolbar mark-up failed several checks in the
DAC audit. The corrections are applied to the rendered DOM at runtime in
[richTextAccessibility.ts](src/components/question-page/inputs/richTextAccessibility.ts),
because TinyMCE offers no configuration for any of it.

Two of those corrections change how a screen reader sees the editor, in ways no
automated tool can check:

- `role="application"` is removed from TinyMCE's outer wrapper. That role forced NVDA
  into focus mode across the whole editor, which is why the toolbar controls were
  invisible to browse mode and to the elements list. Removing it is what the audit
  asked for, but it also changes which keys NVDA passes through to the page.
- TinyMCE runs in inline mode, so the editing area is an element in the page carrying
  `role="textbox"` rather than a `contenteditable` body inside an iframe. That is what
  makes it announce as a text box with the question title as its name.

Hence this manual pass.

Run it whenever `richTextAccessibility.ts` changes, when TinyMCE is upgraded, and
before signing off any related accessibility ticket.

### What to test on

The advert builder eligibility page, which is a single rich text question:

```
/apply/admin/scheme/{schemeId}/advert/{advertId}/furtherInformation/1
```

Reached through: Grant scheme, Create an advert, section 5 "Further information",
page 1 "Eligibility information". The question is "Add eligibility information for
your grant".

Test in Chrome and in Firefox. NVDA behaves differently in each, and DAC test both.

### Setup

- NVDA, free from [nvaccess.org](https://www.nvaccess.org/download/).
- Turn on the speech viewer to capture evidence: NVDA menu (`NVDA+N`), Tools, Speech
  viewer. Copy its contents into the ticket at the end.
- `NVDA` below means the NVDA modifier key, which is `Insert` on the desktop keyboard
  layout and `Caps Lock` on the laptop layout.

Keys used in this script:

| Key                 | Does                                       |
| ------------------- | ------------------------------------------ |
| `NVDA+F7`           | Opens the elements list                    |
| `NVDA+Space`        | Toggles between browse mode and focus mode |
| `Down` / `Up`       | Moves the browse mode cursor               |
| `Tab` / `Shift+Tab` | Moves keyboard focus                       |

### The checks

Each check states the expected result. Anything else is a finding: record it verbatim
from the speech viewer rather than paraphrasing.

1. **The controls are discoverable.** Press `NVDA+F7`, filter to buttons. The list
   contains "Styling: Paragraph", "Bold", "Italic", "Bullet list", "Numbered list" and
   "Insert/edit link". Before the fix the list contained none of them.

2. **The wrapper is not an application.** From the top of the page, arrow down through
   the editor in browse mode. Each control is announced as a button with its name, and
   at no point is "application" announced.

3. **The toolbar announces its purpose.** As the browse cursor enters the toolbar,
   NVDA announces "Formatting toolbar".

4. **The controls work in browse mode.** With the browse cursor on "Bold", press
   `Enter`. The button activates and NVDA reports its pressed state. Repeat with
   `Space`. This is the check that matters most: it proves the controls are operable
   without the user needing to know about focus mode.

5. **Tab reaches the toolbar once.** From the control before the editor, press `Tab`.
   Focus lands on exactly one toolbar button and NVDA announces it by name. Pressing
   `Tab` again moves into the editing area rather than to the next button, and
   `Shift+Tab` from the toolbar returns to the control before the editor.

6. **The styling menu works.** With focus or the browse cursor on "Styling:
   Paragraph", press `Enter`. The menu opens, NVDA switches to focus mode by itself and
   announces "Stylings menu". `Up` and `Down` move through Paragraph and Heading 2 to
   Heading 6, announcing the checked state of each. `Enter` applies the selected format
   and returns focus to the button, whose name updates to match, for example "Styling:
   Heading 2". `Escape` closes the menu without applying anything.

7. **The editing area announces as a text box.** `Tab` into the editing area. NVDA
   announces the question title, that it is a multi-line edit field, and the hint text
   below the title, then enters focus mode by itself. It must not announce "Rich Text
   Area. Press ALT-0 for help", which was the iframe wording DAC reported. Typing
   produces text, and the formatting applied at check 6 is announced when the caret
   moves over it.

8. **The error is announced with the field.** Save the page with the editor empty so the
   validation error appears, then `Tab` into the editing area. NVDA announces the error
   message after the question title and reports the field as invalid.

9. **The link dialog can be closed from the keyboard.** Activate "Insert/edit link" to
   open the dialog, then `Tab` through it. Focus reaches the "Close" button in the
   dialog header, NVDA announces it as "Close button", and `Enter` closes the dialog.
   Worth doing deliberately: TinyMCE simulates `Tab` inside its dialogs rather than
   relying on the browser, so removing the button's `tabindex="-1"` is only half the
   story and the automated checks cannot prove focus actually lands there.

10. **The URL field behaves as a combobox.** In the link dialog, `Tab` to the "URL" field.
    NVDA announces it as a combo box. Type a character, and as suggestions appear NVDA
    announces the list and the number of options. `Down` and `Up` move through them,
    announcing each one and its position, while the caret stays in the field. `Enter`
    puts the highlighted suggestion into the field. Note that focus never leaves the
    field: the suggestions are announced through `aria-activedescendant`, so if NVDA goes
    silent as you arrow, that is the finding to record.

    If no suggestions appear at all, add a heading to the editor content first and reopen
    the dialog, since TinyMCE builds the list from headings and anchors in the document.

11. **Arrow keys in focus mode.** With focus on a toolbar button, press `NVDA+Space` to
    enter focus mode, then `Left` and `Right`. Focus moves between the toolbar buttons.

### Expected result for arrow keys in browse mode

In browse mode, `Left` and `Right` on the toolbar move the browse cursor rather than
moving between buttons. That is correct and expected: NVDA reserves the arrow keys for
its own cursor unless a control opts into focus mode, and buttons and toolbars do not.
The W3C toolbar pattern example behaves the same way.

Record it as expected behaviour rather than as a finding. Checks 1, 2 and 4 are what
demonstrate the controls are operable in browse mode.

### Recording the result

Add to the ticket:

- NVDA version, browser and version, operating system, date, tester.
- Pass or fail against each numbered check.
- The speech viewer log.

### Other screen readers

- **JAWS**, if available, uses the same virtual cursor and forms mode split, so the
  script applies unchanged. Run at least checks 1, 4 and 6.
- **VoiceOver** has no equivalent mode split, so `VO` plus the arrow keys always reach
  the controls. It is not affected by this change and does not need a pass.

### Voice dictation

DAC also reported that dictation software could not enter text into the editor. Inline
mode improves that, because the editing area is now an element in the page rather than a
document inside an iframe, but Dragon's support for `contenteditable` remains partial:
dictating text works, selection and correction commands may not. The only way to resolve
it outright is a native `<textarea>`, which would mean giving up the formatting controls.
Treat it as a residual risk to agree with DAC rather than as a check that passes.

### If a check fails

Do not reinstate `role="application"`. It is the cause of the original audit finding,
and it removes the toolbar from browse mode and from the elements list entirely.

If check 4 or check 6 fails, so the controls genuinely cannot be operated without
entering focus mode, the fallback is to drop the roving tabindex in
`makeToolbarKeyboardAccessible` and make every `.tox-tbtn` a tab stop, which removes
any dependency on arrow keys in either mode. That deviates from the fix DAC
recommended, so agree it with them before implementing it.
