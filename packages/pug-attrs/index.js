const assert = require('assert');
const constantinople = require('constantinople');
const runtime = require('pug-runtime');
const stringify = require('js-stringify');

function isConstant(src) {
  return constantinople(src, {pug: runtime, pug_interp: undefined});
}
function toConstant(src) {
  return constantinople.toConstant(src, {pug: runtime, pug_interp: undefined});
}

module.exports = compileAttrs;
/**
 * options:
 *  - terse
 *  - runtime
 *  - format ('html' || 'object')
 */
function compileAttrs(attrs, options) {
  assert(Array.isArray(attrs), 'Attrs should be an array');
  assert(
    attrs.every(
      (attr) =>
        attr &&
        typeof attr === 'object' &&
        typeof attr.name === 'string' &&
        (typeof attr.val === 'string' || typeof attr.val === 'boolean') &&
        typeof attr.mustEscape === 'boolean'
    ),
    'All attributes should be supplied as an object of the form {name, val, mustEscape}'
  );
  assert(options && typeof options === 'object', 'Options should be an object');
  assert(
    typeof options.terse === 'boolean',
    'Options.terse should be a boolean'
  );
  assert(
    typeof options.runtime === 'function',
    'Options.runtime should be a function that takes a runtime function name and returns the source code that will evaluate to that function at runtime'
  );
  assert(
    options.format === 'html' || options.format === 'object',
    'Options.format should be "html" or "object"'
  );

  let buf = [];
  let classes = [];
  const classEscaping = [];

  function addAttribute(key, val, mustEscape, buf) {
    if (isConstant(val)) {
      if (options.format === 'html') {
        const str = stringify(
          runtime.attr(key, toConstant(val), mustEscape, options.terse)
        );
        const last = buf[buf.length - 1];
        if (last && last[last.length - 1] === str[0]) {
          buf[buf.length - 1] = last.substr(0, last.length - 1) + str.substr(1);
        } else {
          buf.push(str);
        }
      } else {
        val = toConstant(val);
        if (mustEscape) {
          val = runtime.escape(val);
        }
        buf.push(`${stringify(key)}: ${stringify(val)}`);
      }
    } else if (options.format === 'html') {
      buf.push(
        `${options.runtime('attr')}("${key}", ${val}, ${stringify(
          mustEscape
        )}, ${stringify(options.terse)})`
      );
    } else {
      if (mustEscape) {
        val = `${options.runtime('escape')}(${val})`;
      }
      buf.push(`${stringify(key)}: ${val}`);
    }
  }

  attrs.forEach((attr) => {
    const key = attr.name;
    let {val} = attr;
    const {mustEscape} = attr;

    if (key === 'class') {
      classes.push(val);
      classEscaping.push(mustEscape);
    } else {
      if (key === 'style') {
        if (isConstant(val)) {
          val = stringify(runtime.style(toConstant(val)));
        } else {
          val = `${options.runtime('style')}(${val})`;
        }
      }
      addAttribute(key, val, mustEscape, buf);
    }
  });
  const classesBuf = [];
  if (classes.length) {
    if (classes.every(isConstant)) {
      addAttribute(
        'class',
        stringify(runtime.classes(classes.map(toConstant), classEscaping)),
        false,
        classesBuf
      );
    } else {
      classes = classes.map((cls, i) => {
        if (isConstant(cls)) {
          cls = stringify(
            classEscaping[i] ? runtime.escape(toConstant(cls)) : toConstant(cls)
          );
          classEscaping[i] = false;
        }
        return cls;
      });
      addAttribute(
        'class',
        `${options.runtime('classes')}([${classes.join(',')}], ${stringify(
          classEscaping
        )})`,
        false,
        classesBuf
      );
    }
  }
  buf = classesBuf.concat(buf);
  if (options.format === 'html') return buf.length ? buf.join('+') : '""';
  return `{${buf.join(',')}}`;
}
