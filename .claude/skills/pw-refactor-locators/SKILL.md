---
name: pw-refactor-locators
description: Refactor existing Playwright test locators away from CSS/XPath selectors toward recommended user-visible locators (getByRole, getByLabel, getByText, getByPlaceholder). When no semantic locator is available, adds a `data-testid` to the application source and uses `getByTestId`. Falls back to a well-named CSS locator constant only as a last resort. Runs the affected tests afterward and reports a summary of what changed.
---

Refactor a Playwright test's CSS/XPath locators to the recommended user-visible locator strategy. This skill carries its own locator-strategy knowledge and does not depend on any project rules file being present — it works standalone in any Playwright project.

**Never skip `AskUserQuestion` steps in this skill, even if told to work autonomously.**

## Instructions

### 1. Ask which test(s) to refactor

Use the `AskUserQuestion` tool:

- Question: "Which test(s) should I refactor locators in?"
- Header: "Refactor scope"
- Option 1: label "All tests", description "Scan every spec file under the test directory for CSS/XPath locators"
- Option 2: label "Specific test", description "I'll name the file or test title to target"

If the user picks "Specific test", ask for the file path or `test()` title. Confirm the resolved scope before proceeding.

### 2. Inventory the existing locators in scope

Read each spec file in scope end-to-end. For every locator used in an action (`click`, `fill`, `check`, `selectOption`) or assertion, classify it:

- **Already user-visible** — `getByRole`, `getByLabel`, `getByText`, `getByPlaceholder`, `getByTestId` on an existing, real `data-testid`. Leave these alone.
- **CSS selector** — `page.locator('.class')`, `page.locator('#id')`, `page.locator('div > span')`, attribute selectors, tag selectors used as the whole locator (not scoping), etc.
- **XPath selector** — `page.locator('xpath=...')` or any `//` expression.

Build a list of every locator that needs refactoring, with its file, line, and the surrounding method/test.

If a page object layer exists (e.g. a `pages/` or `page-objects/` directory), locators typically live inside page object methods rather than directly in spec files — inventory locators there instead of (or in addition to) the spec files.

### 3. Find the underlying element in the application source

For each flagged locator, locate the exact element it targets in the frontend application source code (component templates, JSX/TSX, Angular templates, Vue SFCs, plain HTML — whatever the project uses). Read enough surrounding markup to see:

- The element's tag and attributes (`role`, `aria-label`, `<label for>` association, `placeholder`, visible text/content)
- Whether the element or an ancestor already carries a `data-testid`
- Whether the element repeats (list item, card, row) — refactoring must preserve uniqueness, not just swap the selector type

### 4. Apply the locator strategy, highest priority first

For each flagged locator, work down this priority order and stop at the first one that produces a **unique, reliable** locator for that element:

1. **`getByRole`** — the primary choice. Covers buttons, links, headings, textboxes, checkboxes, comboboxes, and more, matched by their accessible role and (usually) visible name/text.
2. **`getByLabel`** — form inputs that have an associated `<label>` (via `for`/`id`, or wrapping).
3. **`getByText`** — static, non-interactive text content or link text with no better role match.
4. **`getByPlaceholder`** — only when no label exists.
5. **`getByTestId`** — when none of the above can produce a unique, reliable locator. If the element has no `data-testid` in the source, **add one** (see step 5) rather than reaching for CSS.
6. **CSS selector on a stable structural tag** (`header`, `nav`, `section`, `footer`) — acceptable only for **scoping** a chain (e.g. `page.locator('header').getByRole('link', { name: 'Home' })`), never as the sole/final locator for an interactive element, and never based on a styling class name.

Rules that apply regardless of which tier you land on:

- **Exact text from source** — never paraphrase or guess visible text/labels; copy them from the source you just read.
- **Uniqueness** — the refactored locator must resolve to exactly one element wherever it's used in an action. If the natural role/text-based locator would match multiple elements (repeated cards, rows, list items), scope it to its container first (`container.getByRole(...)`) rather than dropping to CSS or using `.first()`.
- **Prefer `name`/`hasText` on the locator constructor** over a bare locator plus `.filter()`, when one is enough.
- **`exact: true`** on `getByRole`/`getByText` when the visible text is short and could otherwise partial-match a longer string elsewhere on the page.

If a page object layer is in use, keep locators inline inside the method that already contained them — do not introduce locator properties or class-level constants as part of this refactor.

### 5. Add `data-testid` when no semantic locator works

When step 4 falls through to tier 5 because no role, label, text, or placeholder can uniquely and reliably identify the element:

1. Add a `data-testid` attribute directly to the element in the application source.
2. Name it `<subject>-<descriptor>-<element>` — it must end with a noun naming the **element itself** (`button`, `input`, `badge`, `checkmark`, `dialog`, `card`, `row`), not an action or state.
   - Good: `article-delete-button`, `comment-list-item`, `login-error-alert`
   - Bad: `article-deleted`, `is-loading`, `comment-1`
3. Use `page.getByTestId('...')` in the test to match.

Only add a `data-testid` to elements that actually need it for this refactor — don't sprinkle them speculatively across unrelated markup in the same file.

### 6. CSS locator constant — last resort only

If, after exhausting steps 4 and 5, there is genuinely no way to add a `data-testid` (e.g. the markup is generated by a third-party library you cannot modify) and no semantic locator applies, you may fall back to a CSS selector — but only as a named constant in the test/page-object file, never inlined.

- Declare it as a `const` near the top of the file (or class) it's used in, with a **descriptive, non-abbreviated name** ending in a type-appropriate suffix (e.g. `authorAvatarLocator` is not required — follow whatever locator-constant naming convention the project already uses elsewhere in its test suite; if none exists, use camelCase, descriptive, no abbreviations).
- Add a one-line comment directly above the constant explaining _why_ no semantic locator or `data-testid` was possible.
- Never use a styling/utility class name (`.font-bold`, `.grid > div`) as the selector basis — only stable structural attributes.

Keep a running count of how many times this fallback is used — it belongs in the final report and should be rare.

### 7. Run the refactored test(s)

```bash
npx playwright test <file-or-pattern> --retries 0
```

If passing → step 8. If failing → debug:

- Read the terminal error, failing line, and locator involved.
- If the locator doesn't match — re-check the source for exact text/attributes and adjust.
- If the locator matches multiple elements — add container scoping.
- If a newly added `data-testid` isn't found — confirm the attribute was actually saved to the source file and the dev/build artifacts used by the test run reflect it.

Repeat until the test(s) pass. If a failure turns out to be unrelated to the locator refactor (an application bug), stop and explain it to the user rather than guessing at a fix.

### 8. Final report

Once tests pass, report a summary directly to the user:

```
## Locator refactor summary

- Locators refactored: <N>
  - → getByRole: <n>
  - → getByLabel: <n>
  - → getByText: <n>
  - → getByPlaceholder: <n>
  - → getByTestId (existing data-testid): <n>
- New `data-testid` attributes added to source: <N>
  - <file:line> — `data-testid="..."`
  - ...
- CSS locator constants kept as last resort: <N>
  - <file:line> — <constant name> — <one-line reason>
- Test run result: <pass/fail>, `<file-or-pattern>` used
```

List the specific `data-testid` additions and any CSS fallbacks explicitly (file + value) so the user can review the source changes at a glance. Omit sub-bullets for categories with zero items.
