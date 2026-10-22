const fs = require('fs');
const path = require('path');
const assert = require('assert');
const walk = require('pug-walk');
const lex = require('pug-lexer');
const parse = require('pug-parser');
const load = require('..');

test('pug-load', () => {
  const filename = `${__dirname}/foo.pug`;
  let ast = load.file(filename, {
    lex,
    parse,
  });

  ast = walk(
    ast,
    (node) => {
      if (node.filename)
        node.filename = `<dirname>/${path.basename(node.filename)}`;
      if (node.fullPath)
        node.fullPath = `<dirname>/${path.basename(node.fullPath)}`;
    },
    {includeDependencies: true}
  );

  expect(ast).toMatchSnapshot();
});
