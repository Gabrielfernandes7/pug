# TypeScript Migration Roadmap

This document outlines the migration strategy for converting the pug monorepo from JavaScript to TypeScript. All 12 packages will be converted in priority order to ensure stability and minimize risk.

## Conversion Priorities

### Phase 1: Foundation (Minimal Risk)
These packages have no dependencies on other pug packages or have minimal complexity.

#### 1. **pug-error** (Status: ~90% done)
- **Lines:** ~500
- **Complexity:** Low
- **Dependencies:** None (standalone)
- **Why First:** Already 2 TypeScript files; quick win to validate toolchain
- **Timeline:** 1-2h
- **Notes:** Complete any remaining JS → TS conversion, verify types

---

### Phase 2: Core Lexer/Parser (Medium Risk)
These form the heart of the compiler and are well-tested.

#### 2. **pug-lexer** (Status: Conversion planned)
- **Lines:** ~1,700
- **Complexity:** Medium
- **Dependencies:** character-parser, is-expression, pug-error
- **Why Here:** Well-tested, good reference for other conversions
- **Timeline:** 8-12h
- **Notes:** 
  - Prototype-based class structure → modern ES6 class syntax
  - Establish build configuration as template for others
  - Snapshot tests ensure compatibility

#### 3. **pug-parser** (Status: Next after lexer)
- **Lines:** ~2,500
- **Complexity:** Medium-High
- **Dependencies:** pug-error, token-stream, character-parser
- **Why Here:** Depends on lexer output (well-typed after conversion)
- **Timeline:** 10-14h
- **Notes:** Complex grammar rules, good test coverage validates migration

#### 4. **pug-code-gen** (Status: After parser)
- **Lines:** ~1,200
- **Complexity:** Medium
- **Dependencies:** pug-error, pug-walk
- **Why Here:** Depends on parser AST, self-contained code generation
- **Timeline:** 6-10h

---

### Phase 3: Utilities (Low-Medium Risk)
Small, focused utility packages with few dependencies.

#### 5. **pug-walk** (Status: After code-gen)
- **Lines:** ~300
- **Complexity:** Low
- **Dependencies:** None
- **Why Here:** AST traversal utility, used by code-gen and others
- **Timeline:** 2-4h

#### 6. **pug-strip-comments** (Status: Parallel possible)
- **Lines:** ~150
- **Complexity:** Low
- **Dependencies:** None
- **Why Here:** Simple regex-based transformation
- **Timeline:** 1-2h

#### 7. **pug-attrs** (Status: After strip-comments)
- **Lines:** ~400
- **Complexity:** Low-Medium
- **Dependencies:** None
- **Why Here:** Attribute parsing utilities, isolated logic
- **Timeline:** 3-5h

#### 8. **pug-filters** (Status: Parallel possible)
- **Lines:** ~800
- **Complexity:** Medium
- **Dependencies:** Async function handling, no pug deps
- **Why Here:** Filter registry, dynamic module loading
- **Timeline:** 6-8h

#### 9. **pug-linker** (Status: After filters)
- **Lines:** ~400
- **Complexity:** Low-Medium
- **Dependencies:** pug-error
- **Why Here:** Name resolution and linking utilities
- **Timeline:** 4-6h

---

### Phase 4: Infrastructure & Main (High Risk)
These have more complex dependencies and affect the public API.

#### 10. **pug-load** (Status: After core utilities)
- **Lines:** ~600
- **Complexity:** Medium
- **Dependencies:** pug-error, pug-linker, fs module
- **Why Here:** File I/O and caching; depended on by main `pug` package
- **Timeline:** 6-8h
- **Notes:** Path traversal security review during migration

#### 11. **pug-runtime** (Status: After utilities)
- **Lines:** ~500
- **Complexity:** Low-Medium
- **Dependencies:** None (runtime helper)
- **Why Here:** Injected into compiled code; affects all compilation
- **Timeline:** 4-6h

#### 12. **pug** (Status: Last)
- **Lines:** ~1,500+
- **Complexity:** High (integrates everything)
- **Dependencies:** All other packages
- **Why Here:** Main API surface; depends on all phase 2-3 conversions
- **Timeline:** 10-14h
- **Notes:** Test public API thoroughly; this is the package users depend on

---

## Estimated Timeline

| Phase | Packages | Effort | Duration |
|-------|----------|--------|----------|
| 1 | pug-error | 1-2h | 1 day |
| 2 | pug-lexer, pug-parser, pug-code-gen | 24-36h | 3-4 days |
| 3 | pug-walk, pug-strip-comments, pug-attrs, pug-filters, pug-linker | 16-25h | 2-3 days |
| 4 | pug-load, pug-runtime, pug | 20-28h | 2-3 days |
| **Total** | **12 packages** | **61-91h** | **~2 weeks** |

### Parallelization Opportunities
- Phase 3 utilities can run in parallel with Phase 2 (once pug-error & pug-walk are done)
- pug-walk should be done before pug-code-gen (small; unblocks others)

---

## Success Criteria

For each package migration:
- ✅ All JS → TS conversion complete
- ✅ TypeScript strict mode passes (no `any` unless documented)
- ✅ All existing tests pass unchanged (snapshot tests included)
- ✅ Coverage threshold maintained (80%+)
- ✅ `.d.ts` files auto-generated correctly
- ✅ Build output validates against existing output (bit-for-bit if possible)

Final criteria:
- ✅ All 12 packages converted
- ✅ Zero test failures
- ✅ `yarn build` succeeds for all
- ✅ `yarn test` passes with 80%+ coverage

---

## Rollback Strategy

If a conversion fails:
1. `git reset --hard HEAD~1` to revert
2. Document the issue in the conversion log
3. Skip that package or revisit with more time/investigation

High-risk packages (Phase 4) get extra validation before merging.

---

## Build Configuration Template

Each package will follow this structure:
```
packages/pug-lexer/
├── src/
│   └── index.ts          # Main source file(s)
├── lib/
│   ├── index.js          # Compiled output (generated)
│   └── index.d.ts        # Type definitions (generated)
├── test/                 # Unchanged test files
├── package.json          # Updated with "build" script
└── tsconfig.json         # (Optional) If custom settings needed
```

---

## References

- [TYPESCRIPT_CONVERSION_GUIDE.md](./TYPESCRIPT_CONVERSION_GUIDE.md) — Step-by-step conversion template
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- Project tsconfig.json for strict mode settings
