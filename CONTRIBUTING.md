# Contributing to Pug

Thanks for helping improve Pug! This guide covers how to set up the monorepo, run the checks CI runs, and open a pull request. For how the code is organized internally, read [ARCHITECTURE.md](./ARCHITECTURE.md) first.

## Before you start

- For bug reports, feature requests and questions, [open an issue](https://github.com/pugjs/pug/issues/new) first if the change is large or changes behavior. Small fixes and documentation changes can go straight to a pull request.
- Security issues must **not** go in public issues. See [SECURITY.md](./SECURITY.md).

## Requirements

- **Node.js 18 or newer.** CI runs the test suite on Node 18.x, 20.x and 22.x, so make sure your change works on all three.
- **Yarn 1 (classic).** The repository uses `yarn.lock` in the v1 format, and CI installs with `yarn install --frozen-lockfile`. Do not use npm or pnpm to install dependencies, because they would create lockfiles that the repository does not track.

## Setting up

```bash
git clone https://github.com/pugjs/pug.git
cd pug
yarn install
yarn build
yarn test
```

`yarn test` runs `yarn build` first (via the `pretest` script), so you only need to run `yarn build` by hand when you want to build without running tests.

## Repository layout

Pug is a Yarn workspaces monorepo. Every directory under `packages/` is a separately published npm package with its own `package.json`, README, and tests.

```
packages/
  pug/              # Public entry point: compile, render, and express integration
  pug-lexer/        # String -> tokens (TypeScript; source in src/, output in lib/)
  pug-parser/       # Tokens -> AST
  pug-load/         # Resolves include / extends and loads dependency files
  pug-linker/       # Links extends / blocks into a single AST
  pug-filters/      # Runs :filter blocks at compile time
  pug-code-gen/     # AST -> JavaScript template function source
  pug-attrs/        # Generates code for attributes
  pug-runtime/      # Helpers used by generated templates at render time
  pug-strip-comments/ # Removes comment tokens
  pug-walk/         # AST walker used by other packages
  pug-error/        # Error objects with source location (TypeScript)
scripts/            # Build and test helpers (prebuild, Jest serializers)
```

For what each package does and how they connect, see [ARCHITECTURE.md](./ARCHITECTURE.md). The TypeScript migration status is tracked in [TYPESCRIPT_MIGRATION_ROADMAP.md](./TYPESCRIPT_MIGRATION_ROADMAP.md).

## Common commands

| Command | What it does |
| --- | --- |
| `yarn build` | Runs `scripts/prebuild`, builds every package that has a `build` script, and compiles the `scripts` project. |
| `yarn test` | Runs `yarn build` and then the Jest test suite. |
| `yarn watch` | Runs Jest in watch mode. |
| `yarn coverage` | Runs Jest with coverage. |
| `yarn lint` | Runs ESLint on the whole repository. |
| `yarn lint:fix` | Runs ESLint and applies automatic fixes. |
| `yarn format` | Formats all `.js` files with Prettier. |
| `yarn prettier:check` | Fails if any `.js` file is not formatted. This is what CI runs. |

### Generated files

`scripts/prebuild.js` generates files as part of `yarn build`. It creates a `LICENSE` file in each package that does not have one, and writes the TypeScript composite configuration for packages that use TypeScript. Do not edit generated `lib/` output by hand. For `pug-lexer` and `pug-error`, edit the TypeScript source in `src/` and rebuild.

## Coding standards

- **Formatting:** Prettier, configured in `.prettierrc.js` (single quotes, no bracket spacing, trailing commas). `.editorconfig` sets two-space indentation, LF line endings and a final newline.
- **Linting:** ESLint, configured in `.eslintrc.json`. The rules there are explicit (single quotes, semicolons, `prefer-const`, and so on). `eslint-config-airbnb-base` is installed but not extended, so it does not apply.
- **Pre-commit hook:** Husky runs `lint-staged` on commit. Staged `*.js` files are passed through `eslint --fix` and `prettier --write`. If the hook changes files, stage them again before committing.
- **Coverage:** `package.json` enforces global Jest coverage thresholds of 80% statements, 70% branches, 80% functions and 80% lines. A change that drops coverage below these thresholds will fail `yarn coverage`.
- **Match the surrounding code.** Keep the naming, comment density and style of the file you are editing.

## Writing tests

- Tests live in `packages/<name>/test/`. Snapshot tests keep their snapshots in `__snapshots__/`.
- Add a test for every bug fix. Name the test after the behavior it checks, not the implementation.
- Only update a snapshot when the output change is intended. Review the snapshot diff in the pull request.
- If you change compiled output, run `yarn test` on the whole repository, not only the package you edited, because other packages depend on the output.

## Commits and pull requests

### Commit messages

The history follows [Conventional Commits](https://www.conventionalcommits.org/) prefixes, for example:

- `feat:` a new feature
- `fix:` a bug fix
- `refactor:` a change that does not change behavior
- `test:` tests only
- `docs:` documentation only
- `chore:` tooling, dependencies and maintenance
- `ci:` CI configuration

Write the subject in the imperative mood and keep it short. Use the body to explain *why* the change is needed when that is not obvious from the diff.

### Branches

Use a descriptive branch name with the same prefix, for example `fix/doctype-validation` or `docs/filter-guide`.

### Pull requests

- Target `master`. CI runs on every pull request to `master`.
- Keep each pull request focused on one change. Separate refactors from behavior changes.
- Before requesting review, make sure these pass locally:
  1. `yarn lint`
  2. `yarn prettier:check`
  3. `yarn test`
- Describe what changed and how you tested it. Link the issue it addresses, if there is one.

### Versioning and changelogs

Releases are published by the GitHub Actions workflow in `.github/workflows/rollingversions.yml`, which uses `rollingversions`. Do not edit `version` fields or the `VERSION_TABLE` block in the root `README.md` by hand. Ask a maintainer if your change needs a changelog entry.

## Getting help

If you are unsure about the approach, open a draft pull request or an issue before writing a large change. The [chat room](https://gitter.im/pugjs/pug) is linked from the root README for discussion.
