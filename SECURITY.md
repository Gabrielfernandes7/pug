# Security Policy

This document describes what Pug does and does not protect against, the assumptions it makes about the code and data you pass to it, and how to report a vulnerability.

## Threat Model

Pug operates under a **user-trust model**. The people who write templates, options and filter plugins are assumed to be trusted developers. Pug is a compiler and renderer, not a sandbox.

| Input | Trust level | Notes |
| --- | --- | --- |
| Template source (`pug.compile`, `pug.render`, template files) | Trusted | Templates can execute JavaScript through `-` and `=` code, and through filters. |
| Template data (`locals`) | Trusted for `!=`; should be escaped otherwise | Escaped output (`=`, interpolation) is safe for HTML text and attribute values. Unescaped output (`!=`) is not. |
| Options (`basedir`, `filters`, `plugins`, `filterOptions`, `filterAliases`) | Trusted | Options control which code runs and which files are read. |
| Filter plugins (`:name` blocks, `jstransformer-*` packages) | Trusted code | They run with full Node.js privileges. |
| Included and extended files | Trusted | `include` and `extends` read files from disk. |

**Recommendation:** Do not compile or render Pug templates that come from untrusted sources, such as user-generated content or uploads, unless you run them in a sandbox such as a separate process with restricted file system and network access.

## Security Assumptions

### Template Expressions and Output Escaping

- Pug escapes HTML by default. `=` and `#{...}` escape `&`, `<`, `>` and `"` in their output.
- Unescaped output (`!=` and `!{...}`) is safe only when the value is trusted.
- Attribute values are escaped as well. Attribute values that are not strings are rendered by the attribute helpers in `pug-runtime`.
- **Best practice:** Use escaped output for all data, and reserve `!=` for markup you have generated or sanitized yourself.

### Filters and Plugins

- Filter plugins (custom filters and `jstransformer-*` packages) are assumed to be **trusted code**.
- Filters run at compile time, inside your Node.js process, with full access to the file system, network and environment. A filter cannot be restricted by Pug.
- Filter names come from the template. If you let users influence which filters are used, validate the names against an allowlist.
- Filter options must be constant values. Pug rejects options that depend on variables (`FILTER_OPTION_NOT_CONSTANT`), which keeps filter arguments fixed at compile time.
- Plugins (`options.plugins`) can change every stage of the pipeline, including the generated code. Only install plugins from sources you trust.

### File I/O (`include`, `extends`, `compileFile`, `renderFile`)

- The `pug-load` module resolves file paths relative to the template file, or to `basedir` when it is set.
- Path traversal (for example `../`) is **not restricted** by design. Developers can legitimately reference files outside the template directory.
- Security depends on:
  - `basedir` being set to a safe root directory when templates may reference other files.
  - Template files (`filename` option and paths passed to `compileFile` and `renderFile`) being from trusted sources.
  - Not letting untrusted users choose the template path, the `basedir`, or the included file names.
- Custom `read` and `resolve` plugin hooks replace this file access, so the same trust rules apply to them.

### Caching

- With `cache: true`, `compileFile` and `renderFile` keep compiled templates in `pug.cache`, keyed by filename. A cached template is not recompiled, even if the file on disk changes, until the process restarts or the entry is removed.
- Cache keys are file names only. Do not share the cache between templates from different trust levels.

## Known Limitations

1. **No input validation** on template syntax beyond what the lexer and parser check. Templates are assumed to be well-formed.
2. **No resource limits.** Deeply nested or recursive mixins and includes can exhaust the stack or memory.
3. **No execution timeout.** Templates with infinite loops, or filters that never return, will block the process.
4. **No sandbox** for template code or filter execution. Filters and template code have full Node.js access.
5. **No protection against cross-site scripting in unescaped output.** Developers are responsible for escaping data that is not trusted.

## Supported Versions

Only the latest release of the `pug` package receives security fixes. Other versions are not patched.

| Version | Supported |
| --- | --- |
| Latest release of `pug` (2.0.4 at the time of writing) | :white_check_mark: |
| Earlier releases | :x: |

## Reporting a Vulnerability

Do not report security issues in public GitHub issues, pull requests or chat rooms.

To report a vulnerability, use the [Tidelift security contact](https://tidelift.com/security). Tidelift coordinates the fix and disclosure with the maintainers.

Please include:

- A description of the vulnerability and its impact.
- Steps to reproduce, or a minimal template and options that trigger it.
- The affected version(s) of the affected package(s).
- A suggested fix, if you have one.

### What to expect

1. **Acknowledgment:** Tidelift will confirm that your report has been received.
2. **Triage:** The maintainers will confirm whether the issue is a vulnerability, given the threat model above. Issues that depend on untrusted templates, filters or plugins, which this policy places out of scope, may be closed with an explanation.
3. **Fix and disclosure:** The maintainers will prepare a fix and coordinate a disclosure date with you. Allow up to 30 days for an initial response.

Please keep the issue private until a fix is released.
