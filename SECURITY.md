# Security Policy

## Threat Model

Pug operates under a **user-trust model**:
- **Trusted Input:** Template files and options are assumed to come from trusted developers
- **No Sandbox:** Pug does not sandbox template execution; filters and mixins run in your Node.js process
- **No Protection:** Pug does not protect against malicious templates or untrusted filter plugins

**Recommendation:** Do not process Pug templates from untrusted sources (e.g., user-generated content) without sandboxing.

## Security Assumptions

### Filters & Plugin System
- Filter plugins (custom transformers) are assumed to be **trusted code**
- Filters run with full Node.js capabilities; they can read/write files, execute code, etc.
- Example: `jstransformer` plugins must come from trusted npm packages
- **If you allow users to specify custom filters:** Validate filter names against a whitelist

### File I/O (includes/extends)
- The `pug-load` module resolves file paths relative to a `basedir` or source file location
- Path traversal (e.g., `../`) is **not restricted** by design; developers can legitimately use relative paths
- **Security depends on:**
  - `basedir` being set to a safe root directory
  - Template files (`filename` option) being from trusted sources
  - Not allowing untrusted users to specify arbitrary basedir or template paths

### Template Expressions
- Pug escapes HTML by default (`&` → `&amp;`, etc.) unless you use `!=` (unescaped output)
- Unescaped output (`!=`) is safe if the data is trusted; unsafe if it comes from untrusted sources
- **Best practice:** Always escape user-generated content

## Known Limitations

1. **No input validation** on template syntax (lexer/parser assume well-formed templates)
2. **No resource limits** (infinite recursion in templates can cause stack overflow)
3. **No execution timeout** (templates can hang if they contain infinite loops)
4. **No sandbox** for filter execution (filters have access to Node.js APIs)

## Supported Versions

| Version  | Supported          |
| -------- | ------------------ |
| ^3.0.1   | :white_check_mark: |
| <3.0.1   | :x:                |

## Reporting a Vulnerability

To report a security vulnerability, please email [security@example.com](mailto:security@example.com) or use the
[Tidelift security contact](https://tidelift.com/security).

Please include:
- Description of the vulnerability
- Steps to reproduce (if possible)
- Affected version(s)
- Suggested fix (if you have one)

Tidelift will coordinate the fix and disclosure. Allow 30 days for a response.
