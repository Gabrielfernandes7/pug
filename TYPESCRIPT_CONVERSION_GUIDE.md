# TypeScript Conversion Guide

This guide provides a step-by-step process for converting a pug package from JavaScript to TypeScript. Use this template for each package in the [TYPESCRIPT_MIGRATION_ROADMAP.md](./TYPESCRIPT_MIGRATION_ROADMAP.md).

## Prerequisites

- TypeScript 5.4+ installed (project root)
- tsconfig.json configured in project root
- All tests passing for the target package
- Package.json and build configuration understood

---

## Step 1: Prepare the Package Structure

### 1.1 Create src/ directory
```bash
cd packages/<package-name>
mkdir -p src
```

### 1.2 Move source files to src/
Move `index.js` → `src/index.ts` (and any other source files)

```bash
mv index.js src/index.ts
# If there are other source files:
# mv lib/*.js src/
```

### 1.3 Update package.json

Add a build script and update the files entry:

```json
{
  "scripts": {
    "build": "tsc --outDir lib"
  },
  "files": [
    "lib",
    "README.md",
    "LICENSE"
  ]
}
```

Replace the old entry points:
```json
// OLD:
{
  "main": "index.js",
  "types": "index.d.ts",
  "files": ["index.js", "index.d.ts"]
}

// NEW:
{
  "main": "lib/index.js",
  "types": "lib/index.d.ts",
  "files": ["lib", "README.md", "LICENSE"]
}
```

### 1.4 Create tsconfig.json (optional, if custom settings needed)

Most packages can use the root tsconfig.json. If a package needs custom settings:

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "lib",
    "rootDir": "src"
  },
  "include": ["src/**/*"],
  "exclude": ["test/**/*"]
}
```

---

## Step 2: Convert Source Files to TypeScript

### 2.1 Update CommonJS to ES6 Modules (or keep CommonJS)

Most pug packages use CommonJS. You can either:
- **Keep CommonJS** (recommended for compatibility): Use `export default`, `export const`
- **Convert to ES6 modules**: Update imports/exports (requires build config changes)

#### Option A: Keep CommonJS (Recommended)

```typescript
// OLD (index.js):
module.exports = lex;
module.exports.Lexer = Lexer;

// NEW (index.ts) - Keep as CommonJS export:
export default lex;
export { Lexer };

// tsconfig.json: "module": "commonjs" will compile to CommonJS
```

#### Option B: Use import/export syntax

```typescript
// index.ts
export default lex;
export { Lexer };

// Built output will be CommonJS-compatible with declaration files
```

### 2.2 Update require() to import

```typescript
// OLD:
const assert = require('assert');
const isExpression = require('is-expression');

// NEW:
import assert from 'assert';
import isExpression from 'is-expression';
```

### 2.3 Add JSDoc-style types or TypeScript annotations

Convert JSDoc to TypeScript types:

```typescript
// OLD (JSDoc):
/**
 * Initialize `Lexer` with the given `str`.
 * @param {String} str
 * @param {String} filename
 * @api private
 */
function Lexer(str, options) { }

// NEW (TypeScript class):
interface LexerOptions {
  filename?: string;
  startingLine?: number;
  startingColumn?: number;
  interpolated?: boolean;
  plugins?: any[];
}

class Lexer {
  input: string;
  filename?: string;
  
  constructor(str: string, options?: LexerOptions) {
    // ...
  }
}
```

### 2.4 Add Return Type Annotations

```typescript
// OLD:
function lex(str, options) {
  const lexer = new Lexer(str, options);
  return JSON.parse(JSON.stringify(lexer.getTokens()));
}

// NEW:
interface Token {
  // Define token structure
  type: string;
  value: string;
  line: number;
  column: number;
}

function lex(str: string, options?: LexerOptions): Token[] {
  const lexer = new Lexer(str, options);
  return JSON.parse(JSON.stringify(lexer.getTokens()));
}
```

### 2.5 Handle Prototype-based Classes

Convert from prototype-based to ES6 classes:

```typescript
// OLD (Prototype):
function Lexer(str, options) {
  this.input = str;
}

Lexer.prototype = {
  constructor: Lexer,
  
  error(code, message) {
    // ...
  },
  
  getTokens() {
    // ...
  }
};

// NEW (ES6 Class):
class Lexer {
  input: string;
  
  constructor(str: string, options?: LexerOptions) {
    this.input = str;
  }
  
  error(code: string, message: string): void {
    // ...
  }
  
  getTokens(): Token[] {
    // ...
  }
}
```

### 2.6 Update Require Calls in Code

```typescript
// OLD:
const mod = require(variablePath);

// NEW (if path is dynamic):
import * as mod from './module';

// Or use type assertion if truly dynamic:
const mod = require(variablePath) as unknown;
```

### 2.7 Add Interface/Type Definitions

Extract inline types to interfaces:

```typescript
// Example: Token type definition
interface Token {
  type: 'tag' | 'text' | 'indent' | 'outdent' | 'newline' | 'eos';
  value: string;
  line: number;
  column: number;
}

interface LexerOptions {
  filename?: string;
  startingLine?: number;
  startingColumn?: number;
  plugins?: LexerPlugin[];
  interpolated?: boolean;
}

interface LexerPlugin {
  name: string;
  parse: (lexer: Lexer) => void;
}
```

---

## Step 3: Run TypeScript Compiler

### 3.1 Build the package

From the package directory or root:

```bash
# Build this package
cd packages/<package-name>
tsc --outDir lib

# Or from root with wsrun
yarn build
```

### 3.2 Check for TypeScript Errors

The compiler will report:
- Type errors
- Missing type annotations
- Unused variables (strict mode)

Fix these in order of severity:
1. Type mismatches
2. Missing return types
3. Unused variables/parameters

### 3.3 Verify Generated Files

```bash
ls -la lib/
# Should see:
# - index.js (compiled)
# - index.d.ts (auto-generated type definitions)
```

---

## Step 4: Run Tests

### 4.1 Run package tests

```bash
cd packages/<package-name>
yarn test
```

### 4.2 Verify test output

Tests should pass without modification. If a test fails:
- Check the error message carefully (it's likely a type or logic issue)
- Review the TypeScript conversion for that section
- Fix the source .ts file, recompile, and retry

### 4.3 Check coverage

```bash
yarn coverage
```

Ensure coverage is ≥80% for:
- Statements
- Branches
- Functions
- Lines

---

## Step 5: Build & Integrate

### 5.1 Full monorepo build

```bash
# From root
yarn build
```

This runs the build script in all packages via wsrun.

### 5.2 Run full test suite

```bash
yarn test
```

All 12 packages' tests should pass.

### 5.3 Verify package exports

Test that the compiled output works correctly:

```bash
# For ESM-aware tools:
node -e "const pkg = require('./packages/<package-name>/lib'); console.log(pkg);"
```

---

## Step 6: Review & Commit

### 6.1 Check git diff

```bash
git diff packages/<package-name>/
```

Expected changes:
- ✅ src/index.ts (new TypeScript source)
- ✅ lib/index.js (new compiled output)
- ✅ lib/index.d.ts (new type definitions)
- ✅ package.json (updated scripts and main/types)
- ❌ index.js and index.d.ts (should be deleted)

### 6.2 Clean up old files

```bash
# Remove old JavaScript source files from package root
cd packages/<package-name>
rm index.js index.d.ts
```

### 6.3 Stage and commit

```bash
git add packages/<package-name>/
git commit -m "feat: convert <package-name> to TypeScript

- Migrate src/index.ts from JavaScript
- Configure build output to lib/
- Update package.json entry points
- All tests pass unchanged
- Type definitions auto-generated"
```

---

## Common Patterns & Solutions

### Problem: "any" types spreading

**Solution:** Create specific interfaces for common object shapes:

```typescript
// Instead of:
function process(obj: any): void { }

// Use:
interface ProcessOptions {
  name: string;
  value: number;
}

function process(obj: ProcessOptions): void { }
```

### Problem: Dynamic require() for plugins

**Solution:** Type as unknown, then assert:

```typescript
const plugin = require(dynamicPath) as { parse: (lexer: Lexer) => void };
```

### Problem: Circular imports

**Solution:** Restructure to avoid circles or use `import type`:

```typescript
import type { Lexer } from './lexer';  // Type-only import, no circular dep
```

### Problem: Tests importing from src/

**Solution:** Update jest configuration to handle .ts files:

In root package.json:
```json
{
  "jest": {
    "transform": {
      "^.+\\.tsx?$": "ts-jest"
    },
    "testMatch": ["**/?(*.)+(spec|test).ts"]
  }
}
```

Or keep tests pointing to lib/ (compiled output).

### Problem: Snapshot tests breaking

**Solution:** Run with `--updateSnapshot` if changes are expected:

```bash
yarn test -- --updateSnapshot
```

But verify the changes are correct before committing!

---

## Checklist

- [ ] src/ directory created with .ts source files
- [ ] package.json updated (build script, main/types, files)
- [ ] tsconfig.json created (if custom) or root config used
- [ ] Imports converted from require() to import
- [ ] Exports converted to named/default exports
- [ ] Classes converted from prototype to ES6 syntax
- [ ] JSDoc converted to TypeScript types
- [ ] Return types and parameter types added
- [ ] Interfaces/types extracted to separate section
- [ ] TypeScript compilation succeeds (`tsc` with no errors)
- [ ] All tests pass (`yarn test`)
- [ ] Coverage maintained (≥80%)
- [ ] lib/ output verified (lib/index.js and lib/index.d.ts exist)
- [ ] Full monorepo build succeeds (`yarn build`)
- [ ] Old .js and .d.ts files removed from package root
- [ ] git diff reviewed and cleaned
- [ ] Commit created with clear message

---

## Reference Conversions

Once pug-lexer is converted, use it as a reference:
- Look at pug-lexer/src/index.ts for patterns
- Reference pug-lexer's package.json structure
- Compare build output and .d.ts generation

---

## Questions or Issues?

- Check the [TYPESCRIPT_MIGRATION_ROADMAP.md](./TYPESCRIPT_MIGRATION_ROADMAP.md) for package order
- Review existing converted package's src/ for patterns
- Refer to [TypeScript Handbook](https://www.typescriptlang.org/docs/)
