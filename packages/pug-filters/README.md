# pug-filters

Code for processing filters in pug templates

[![Build Status](https://img.shields.io/travis/pugjs/pug-filters/master.svg)](https://travis-ci.org/pugjs/pug-filters)
[![Dependencies Status](https://david-dm.org/pugjs/pug/status.svg?path=packages/pug-filters)](https://david-dm.org/pugjs/pug?path=packages/pug-filters)
[![DevDependencies Status](https://david-dm.org/pugjs/pug/dev-status.svg?path=packages/pug-filters)](https://david-dm.org/pugjs/pug?path=packages/pug-filters&type=dev)
[![NPM version](https://img.shields.io/npm/v/pug-filters.svg)](https://www.npmjs.org/package/pug-filters)

## Installation

    npm install pug-filters

Most users get `pug-filters` through the `pug` package and do not need to install it directly.

## Filter guide

A filter processes a block of text inside a template at compile time. The output of the filter replaces the block in the generated HTML. For example, a `:markdown-it` block turns Markdown into HTML:

```pug
div
  :markdown-it
    # Hello

    This is **Markdown** inside a Pug template.
```

Filters run once, when the template is compiled, not on every render. Their output is part of the compiled template.

### Syntax

| Syntax | Meaning |
| --- | --- |
| `:name` followed by an indented block | Run filter `name` on the block's text. |
| `:name(key=value)` | Pass constant options to the filter. |
| `:outer:inner` | Run `inner` on the block first, then pass its output to `outer`. |
| `include:name file.ext` | Run filter `name` on the contents of an external file. |

Option values must be constants, such as strings, numbers, booleans or literal objects. Values that refer to variables are rejected at compile time with the error code `FILTER_OPTION_NOT_CONSTANT`, because filter output cannot depend on render-time data.

### Where filters come from

When Pug meets `:name`, it looks for the filter in this order:

1. The `filters` option passed to `pug.compile`, `pug.render` and related functions.
2. The global registry, `pug.filters`.
3. A `jstransformer-<name>` package, resolved from the template's directory first and then from the place where `pug` is installed.

If none of these exists, Pug throws `UNKNOWN_FILTER`.

### Example: custom filter

Pass a function in the `filters` option. It receives the block's text and the filter's options, and returns the replacement text.

```js
const pug = require('pug');

const html = pug.render(
  `
p
  :shout
    hello from pug
`,
  {
    filters: {
      shout: (text) => text.toUpperCase(),
    },
  }
);
// <p>HELLO FROM PUG</p>
```

Attributes on the filter become its options:

```js
const html = pug.render(
  `
:wrap(tag="em")
  hi
`,
  {
    filters: {
      wrap: (text, options) => `<${options.tag}>${text}</${options.tag}>`,
    },
  }
);
// <em>hi</em>
```

### Example: global filter

Register a filter on `pug.filters` to make it available to every template in your process. A filter passed in the `filters` option with the same name takes precedence.

```js
const pug = require('pug');

pug.filters.reverse = (text) => [...text].reverse().join('');

pug.render(`
:reverse
  abc
`);
// cba
```

### Example: jstransformer filter

Filters that come from the JSTransformer ecosystem are installed as separate packages. Install the one you need in your project; `pug-filters` does not ship them.

```bash
npm install jstransformer-markdown-it
```

```js
const pug = require('pug');

pug.render(`
:markdown-it
  # Title
`);
// <h1>Title</h1>
```

Other transformers follow the same pattern, for example `jstransformer-stylus` for `:stylus`. Check each package's documentation for its supported options.

### Example: options for all uses of a filter

`filterOptions` sets default options for a filter by name. Every `:uglify-js` block in the templates below receives these defaults, and an option written in the template overrides the default for that block.

```js
pug.render(
  `
:uglify-js
  function add(a, b) { return a + b; }
`,
  {
    filterOptions: {
      'uglify-js': {output: {beautify: true}},
    },
  }
);
```

### Example: aliases

`filterAliases` lets a template use a short name for a filter, while the real filter name stays in your configuration. Aliases map to a single target. Pug does not follow chains of aliases and throws `FILTER_ALISE_CHAIN` if you try.

```js
pug.render(
  `
:shout
  hey
`,
  {
    filters: {loud: (text) => text.toUpperCase()},
    filterAliases: {shout: 'loud'},
  }
);
// HEY
```

### Example: chaining filters

Chained filters run from right to left. The filter on the right runs first, and its output becomes the input of the filter on the left.

```js
const filters = {
  wrap: (text) => `[${text}]`,
  prefix: (text) => `>${text}`,
};

pug.render(':wrap:prefix\n  x', {filters}); // [>x]
pug.render(':prefix:wrap\n  x', {filters}); // >[x]
```

### Example: minification

Pass `minify` to ask a transformer to minify its output. For JavaScript output Pug uses `jstransformer-uglify-js`, and for CSS output it uses `jstransformer-clean-css`. Install the one that matches your output. If minification fails, Pug returns the unminified output.

```js
pug.render(
  `
:uglify-js(minify=true)
  var x = 1;
  var y = 2;
`
);
// var x=1,y=2;
```

### Example: filtered includes

Use `include:name` to run a filter on a file's contents at compile time. The file path is resolved relative to the template, as with any `include`.

```pug
include:markdown-it intro.md
```

A filter passed in the `filters` option can also define a `renderBuffer(buffer, options)` method. Pug calls it with the raw bytes of the file, which is useful for binary input. Filters without `renderBuffer` receive the file's text.

### Errors

| Code | When it happens |
| --- | --- |
| `UNKNOWN_FILTER` | No filter with that name is registered and no `jstransformer-<name>` package can be resolved. |
| `FILTER_OPTION_NOT_CONSTANT` | An option on a filter refers to a variable instead of a constant. |
| `FILTER_ALISE_CHAIN` | A filter alias points to another alias. |

## Writing your own filter

A filter is a function with this signature:

```js
/**
 * @param {string} text The text of the filter block, with indentation removed.
 * @param {Object} options Constant options from the template, merged with filterOptions.
 * @param {string} [options.filename] The template file that contains the filter.
 * @returns {string} The replacement text.
 */
function myFilter(text, options) {
  return text;
}
```

Guidelines:

- Return a string. Pug inserts it into the output as text without escaping it, so return HTML-safe output for HTML filters.
- Do not depend on render-time data. Filters run at compile time, so their output is fixed when the template compiles.
- Throw an error for invalid input rather than returning partial output. The error propagates out of `pug.compile` or `pug.render`.
- Treat the filter as trusted code. It runs with full Node.js access, so only register filters you wrote or have reviewed. See [SECURITY.md](../../SECURITY.md).

## API

```
var filters = require('pug-filters');
```

### `filters.handleFilters(ast, filters)`

Renders all `Filter` nodes in a Pug AST (`ast`), using user-specified filters (`filters`) or a JSTransformer.

### `filters.runFilter(name, str[, options[, currentDirectory]])`

Invokes filter through `jstransformer`.

This is internally used in `filters.handleFilters`, and is a lower-level interface exclusively for invoking JSTransformer-based filters.

`name` represents the name of the JSTransformer.

`str` represents the string to render.

`currentDirectory` is used when attempting to `require` the transformer module.

`options` may contain the following properties:

- `minify` (boolean): whether or not to attempt minifying the result from the transformer. If minification fails, the original result is returned.

## License

  MIT
