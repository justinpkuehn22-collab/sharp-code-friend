# Poetry Shelf - JK 

Coding standards

- Always enable TypeScript strict mode.

- Never use `any`. Use `unknown` and narrow the type.

- Prefer named exports. Do not use default exports.

- Prefer `const` over `let`. Never use `var`.

Naming conventions

- Use camelCase for variables and functions.

- Use PascalCase for components and types.

- Use kebab-case for file names.

Styling

- Use Tailwind CSS for styling.

- Do not use inline styles.

- Do not use CSS modules.

Libraries

- Use shadcn/ui components when possible.

- Use React Query for server state.

- Use Zustand for client state.

Architecture

- Route API calls through a service layer.

- Do not call `fetch` directly from React components.

Testing

- Write unit tests for new utility functions and hooks.

- Run existing tests after making changes.

- Verify new functionality in the browser before marking it complete.

Code quality

- Run the linter after significant changes.

- Remove unused imports and dead code.

Localization

- Write code comments and variable names in English.

- Use date format DD/MM/YYYY.

- Use European number formatting (comma as decimal separator).

Brand voice

- Use a friendly, professional tone in all user-facing copy.

- Use sentence case for headings and buttons (for example, "Create new project", not "Create New Project").

- Do not use placeholder text like "Lorem ipsum", always write realistic copy.

General rules

- Do not add `console.log` statements.

- Do not use deprecated React patterns.

- Write code comments in English.

## Access and security

The shelf has two kinds of visitors:

- **Readers** type the reader's code and can browse, search and read. They never see empty drafts and can't change anything.
- **The admin** (you) types the admin code and can write, edit, tag, delete and open library insights.

Codes are checked only on the server (`supabase/functions/shelf`). The browser keeps a signed, expiring session token, never the code itself. Wrong codes are rate-limited (5 tries per visitor, 60 overall, per 15 minutes).

Set these secrets in Lovable Cloud:

| Secret | What it does |
| --- | --- |
| `ADMIN_CODE` | Your code. Required to edit; use a long phrase, not a PIN. |
| `READER_CODE` | The code you give friends. Until it's set, the old `SITE_PASSWORD` works for reading only. |
| `SHELF_ALLOWED_ORIGINS` | Optional. Comma-separated extra sites allowed to call the API (for a custom domain). |

Changing either code signs everyone out.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://sharp-code-friend.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/0a0bd705-e65c-4d59-aa2b-4a47ea7b3f06).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
