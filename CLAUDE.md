# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Setup, workflow and pipeline details live in CONTRIBUTING.md and ARCHITECTURE.md. Read them before large changes.

## Commands

- Yarn 1 (classic) with `yarn.lock` v1. Use `yarn`, not npm.
- `yarn test` runs `yarn build` first (`pretest`). Tests run against compiled `lib/` output, so run `yarn build` after changing TypeScript sources in `src/`.
- Run one test file without the full build: `npx jest packages/pug-filters/test/filter-aliases.test.js`
- `yarn lint` and `yarn lint:fix` run ESLint. `yarn format` and `yarn prettier:check` cover only `*.js` files. Markdown is not formatted by Prettier.
- CI runs `yarn prettier:check` and then `yarn test` on Node 18, 20 and 22.

## Generated files

- `yarn build` runs `scripts/prebuild.js`, which writes a `LICENSE` into any package that lacks one, adds a `name` to `package.json` when it is missing, and regenerates each TypeScript package's `tsconfig.json`. Do not hand-edit those generated files.
- `pug-lexer` and `pug-error` are TypeScript. Edit `src/`, never their `lib/` output.

## Conventions

- Commit messages use Conventional Commits prefixes (`feat:`, `fix:`, `refactor:`, `test:`, `docs:`, `chore:`, `ci:`), as in the existing history.
- Branch names use the same prefixes, for example `chore/documentation`. Pull requests target `master`.
- Do not edit `version` fields or the `VERSION_TABLE` block in the root README. Releases are published by the `rollingversions` workflow.
- Snapshot tests live in `__snapshots__/`. Update a snapshot with `-u` only when the output change is intended, and review the diff.
- Every package has its own tests in `packages/<name>/test/`. Other packages depend on compiled output, so run the whole `yarn test` for changes to shared code such as `pug-runtime` or `pug-code-gen`.
