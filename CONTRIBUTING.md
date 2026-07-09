# Contributing to AIFOXX

Contributions are welcome: fixing data, adding tools, and improving the site
are all useful. Keep pull requests focused; smaller changes are easier to review
and merge.

## Local setup

```bash
git clone https://github.com/withkarann/aifoxx.git
cd aifoxx
npm install
npm run dev
```

The dev server runs on http://localhost:8080.

## Checks to run before opening a PR

Run all of these and make sure they pass:

```bash
npm run validate   # tools.json has all required fields and no duplicate slugs
npm run lint       # ESLint
npm run typecheck  # TypeScript, no emit
npm run test       # Vitest unit tests
npm run build      # static build succeeds
```

`npm run check` runs all of these in one step. A git pre-push hook runs
`npm run check` automatically before every push, so a change that fails a check
never reaches the remote.

## Contributing tool data

Tool data lives in `src/data/tools.json`. The shape is defined by the Zod schema
in `src/types/tool.ts`, which is the source of truth.

- Every entry must include all required fields: `name`, `category`,
  `subcategory`, `description`, `url`, `tags`, and `pricing`.
- Do not fabricate anything. If you cannot verify a fact, leave the field `null`
  (where the schema allows it) rather than guessing.
- Every compliance flag set to `true` must have a matching source URL in
  `compliance_sources`, and that URL must be on the vendor's own domain (its
  trust center, security page, or privacy policy). A `true` flag without a source
  on the vendor's domain will not be accepted.
- Use category and subcategory names consistently with the existing entries.
  Check the current list before introducing a new one.
- No duplicate slugs, names, or URLs.

## Correcting a Trust & Security Report

The reports at `/trust/:slug` cover each vendor's certifications, AI-training
posture, and data handling. To correct one, open a
[Data correction issue](https://github.com/withkarann/aifoxx/issues/new?template=data-correction.yml)
with the vendor, the field that is wrong, the correct value, and a link to the
page on the vendor's own domain that shows it. A verbatim quote from that page is
the most useful thing you can include. Report data is maintained centrally so
every certification stays tied to a source, so these corrections are handled as
issues rather than direct file edits, and ship in the next data refresh.

## Pull requests

- Use a Conventional Commits title (for example `feat: add comparison filters`,
  `fix: correct ChatGPT pricing`, `data: add 12 design tools`).
- Describe what changed and why.
- Include before/after screenshots for any UI change.
- Note any change to the data schema.

## Questions

Open a thread in [Discussions](https://github.com/withkarann/aifoxx/discussions).
