const assert = require('assert');
const utils = require('util');
const attrs = require('..');

let options;
function test(input, expected, locals) {
  const opts = options;
  locals = locals || {};
  locals.pug = locals.pug || require('pug-runtime');
  it(`${utils.inspect(input).replace(/\n/g, '')} => ${utils.inspect(
    expected
  )}`, () => {
    const src = attrs(input, opts);
    const localKeys = Object.keys(locals).sort();
    const output = Function(localKeys.join(', '), `return (${src});`).apply(
      null,
      localKeys.map((key) => locals[key])
    );
    if (opts.format === 'html') {
      expect(output).toBe(expected);
    } else {
      expect(output).toEqual(expected);
    }
  });
}
function withOptions(opts, fn) {
  describe(`options: ${utils.inspect(opts)}`, () => {
    options = opts;
    fn();
  });
}

withOptions(
  {
    terse: true,
    format: 'html',
    runtime(name) {
      return `pug.${name}`;
    },
  },
  () => {
    test([], '');
    test([{name: 'foo', val: 'false', mustEscape: true}], '');
    test([{name: 'foo', val: 'true', mustEscape: true}], ' foo');
    test([{name: 'foo', val: false, mustEscape: true}], '');
    test([{name: 'foo', val: true, mustEscape: true}], ' foo');
    test([{name: 'foo', val: 'foo', mustEscape: true}], '', {foo: false});
    test([{name: 'foo', val: 'foo', mustEscape: true}], ' foo', {foo: true});
    test([{name: 'foo', val: '"foo"', mustEscape: true}], ' foo="foo"');
    test(
      [
        {name: 'foo', val: '"foo"', mustEscape: true},
        {name: 'bar', val: '"bar"', mustEscape: true},
      ],
      ' foo="foo" bar="bar"'
    );
    test([{name: 'foo', val: 'foo', mustEscape: true}], ' foo="fooo"', {
      foo: 'fooo',
    });
    test(
      [
        {name: 'foo', val: 'foo', mustEscape: true},
        {name: 'bar', val: 'bar', mustEscape: true},
      ],
      ' foo="fooo" bar="baro"',
      {foo: 'fooo', bar: 'baro'}
    );
    test(
      [{name: 'style', val: '{color: "red"}', mustEscape: true}],
      ' style="color:red;"'
    );
    test(
      [{name: 'style', val: '{color: color}', mustEscape: true}],
      ' style="color:red;"',
      {color: 'red'}
    );
    test(
      [
        {name: 'class', val: '"foo"', mustEscape: true},
        {name: 'class', val: '["bar", "baz"]', mustEscape: true},
      ],
      ' class="foo bar baz"'
    );
    test(
      [
        {name: 'class', val: '{foo: foo}', mustEscape: true},
        {name: 'class', val: '["bar", "baz"]', mustEscape: true},
      ],
      ' class="foo bar baz"',
      {foo: true}
    );
    test(
      [
        {name: 'class', val: '{foo: foo}', mustEscape: true},
        {name: 'class', val: '["bar", "baz"]', mustEscape: true},
      ],
      ' class="bar baz"',
      {foo: false}
    );
    test(
      [
        {name: 'class', val: 'foo', mustEscape: true},
        {name: 'class', val: '"<str>"', mustEscape: true},
      ],
      ' class="&lt;foo&gt; &lt;str&gt;"',
      {foo: '<foo>'}
    );
    test(
      [
        {name: 'foo', val: '"foo"', mustEscape: true},
        {name: 'class', val: '["bar", "baz"]', mustEscape: true},
      ],
      ' class="bar baz" foo="foo"'
    );
    test(
      [
        {name: 'class', val: '["bar", "baz"]', mustEscape: true},
        {name: 'foo', val: '"foo"', mustEscape: true},
      ],
      ' class="bar baz" foo="foo"'
    );
    test([{name: 'foo', val: '"<foo>"', mustEscape: false}], ' foo="<foo>"');
    test(
      [{name: 'foo', val: '"<foo>"', mustEscape: true}],
      ' foo="&lt;foo&gt;"'
    );
    test([{name: 'foo', val: 'foo', mustEscape: false}], ' foo="<foo>"', {
      foo: '<foo>',
    });
    test([{name: 'foo', val: 'foo', mustEscape: true}], ' foo="&lt;foo&gt;"', {
      foo: '<foo>',
    });
  }
);
withOptions(
  {
    terse: false,
    format: 'html',
    runtime(name) {
      return `pug.${name}`;
    },
  },
  () => {
    test([{name: 'foo', val: 'false', mustEscape: true}], '');
    test([{name: 'foo', val: 'true', mustEscape: true}], ' foo="foo"');
    test([{name: 'foo', val: false, mustEscape: true}], '');
    test([{name: 'foo', val: true, mustEscape: true}], ' foo="foo"');
    test([{name: 'foo', val: 'foo', mustEscape: true}], '', {foo: false});
    test([{name: 'foo', val: 'foo', mustEscape: true}], ' foo="foo"', {
      foo: true,
    });
  }
);

withOptions(
  {
    terse: true,
    format: 'object',
    runtime(name) {
      return `pug.${name}`;
    },
  },
  () => {
    test([], {});
    test([{name: 'foo', val: 'false', mustEscape: true}], {foo: false});
    test([{name: 'foo', val: 'true', mustEscape: true}], {foo: true});
    test([{name: 'foo', val: false, mustEscape: true}], {foo: false});
    test([{name: 'foo', val: true, mustEscape: true}], {foo: true});
    test(
      [{name: 'foo', val: 'foo', mustEscape: true}],
      {foo: false},
      {foo: false}
    );
    test(
      [{name: 'foo', val: 'foo', mustEscape: true}],
      {foo: true},
      {foo: true}
    );
    test([{name: 'foo', val: '"foo"', mustEscape: true}], {foo: 'foo'});
    test(
      [
        {name: 'foo', val: '"foo"', mustEscape: true},
        {name: 'bar', val: '"bar"', mustEscape: true},
      ],
      {foo: 'foo', bar: 'bar'}
    );
    test(
      [{name: 'foo', val: 'foo', mustEscape: true}],
      {foo: 'fooo'},
      {foo: 'fooo'}
    );
    test(
      [
        {name: 'foo', val: 'foo', mustEscape: true},
        {name: 'bar', val: 'bar', mustEscape: true},
      ],
      {foo: 'fooo', bar: 'baro'},
      {foo: 'fooo', bar: 'baro'}
    );
    test([{name: 'style', val: '{color: "red"}', mustEscape: true}], {
      style: 'color:red;',
    });
    test(
      [{name: 'style', val: '{color: color}', mustEscape: true}],
      {style: 'color:red;'},
      {color: 'red'}
    );
    test(
      [
        {name: 'class', val: '"foo"', mustEscape: true},
        {name: 'class', val: '["bar", "baz"]', mustEscape: true},
      ],
      {class: 'foo bar baz'}
    );
    test(
      [
        {name: 'class', val: '{foo: foo}', mustEscape: true},
        {name: 'class', val: '["bar", "baz"]', mustEscape: true},
      ],
      {class: 'foo bar baz'},
      {foo: true}
    );
    test(
      [
        {name: 'class', val: '{foo: foo}', mustEscape: true},
        {name: 'class', val: '["bar", "baz"]', mustEscape: true},
      ],
      {class: 'bar baz'},
      {foo: false}
    );
    test(
      [
        {name: 'class', val: 'foo', mustEscape: true},
        {name: 'class', val: '"<str>"', mustEscape: true},
      ],
      {class: '&lt;foo&gt; &lt;str&gt;'},
      {foo: '<foo>'}
    );
    test(
      [
        {name: 'foo', val: '"foo"', mustEscape: true},
        {name: 'class', val: '["bar", "baz"]', mustEscape: true},
      ],
      {class: 'bar baz', foo: 'foo'}
    );
    test(
      [
        {name: 'class', val: '["bar", "baz"]', mustEscape: true},
        {name: 'foo', val: '"foo"', mustEscape: true},
      ],
      {class: 'bar baz', foo: 'foo'}
    );
    test([{name: 'foo', val: '"<foo>"', mustEscape: false}], {foo: '<foo>'});
    test([{name: 'foo', val: '"<foo>"', mustEscape: true}], {
      foo: '&lt;foo&gt;',
    });
    test(
      [{name: 'foo', val: 'foo', mustEscape: false}],
      {foo: '<foo>'},
      {foo: '<foo>'}
    );
    test(
      [{name: 'foo', val: 'foo', mustEscape: true}],
      {foo: '&lt;foo&gt;'},
      {foo: '<foo>'}
    );
  }
);
withOptions(
  {
    terse: false,
    format: 'object',
    runtime(name) {
      return `pug.${name}`;
    },
  },
  () => {
    test([{name: 'foo', val: 'false', mustEscape: true}], {foo: false});
    test([{name: 'foo', val: 'true', mustEscape: true}], {foo: true});
    test([{name: 'foo', val: false, mustEscape: true}], {foo: false});
    test([{name: 'foo', val: true, mustEscape: true}], {foo: true});
    test(
      [{name: 'foo', val: 'foo', mustEscape: true}],
      {foo: false},
      {foo: false}
    );
    test(
      [{name: 'foo', val: 'foo', mustEscape: true}],
      {foo: true},
      {foo: true}
    );
  }
);
