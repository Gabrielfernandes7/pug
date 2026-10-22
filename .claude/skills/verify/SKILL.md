---
name: verify
description: Run the same checks CI runs (Prettier check, ESLint, Jest) and report the results. Use when the user asks to verify, check, or validate the repo before a commit or pull request.
disable-model-invocation: true
---

Run the repository's CI checks in this order and report the result of each. Do not fix anything automatically.

1. `yarn prettier:check`. Checks formatting of all `*.js` files.
2. `yarn lint`. Runs ESLint on the repository.
3. `yarn test`. Runs `yarn build` first (through `pretest`), then the full Jest suite.

Rules:

- Run the steps in order, but keep going after a failure so the user sees every failing check.
- If `$ARGUMENTS` is given, treat it as a Jest path or pattern and run `npx jest $ARGUMENTS` in step 3 instead of the full `yarn test`. Still run steps 1 and 2.
- Report each step as PASS or FAIL. For a failure, include the relevant error output, not a paraphrase.
- Do not say a check passed unless its command exited with status 0.
- End with a one-line summary: all checks passed, or which checks failed.
