const fs = require('fs');
const acorn = require('acorn');
const walk = require('acorn-walk');

let hadErrors = false;

const lexerFunctions = {
  advance: true,
  append: true,
  attributesBlock: true,
  attrs: true,
  blank: true,
  block: true,
  blockCode: true,
  call: true,
  case: true,
  className: true,
  code: true,
  colon: true,
  comment: true,
  conditional: true,
  default: true,
  doctype: true,
  dot: true,
  each: true,
  eachOf: true,
  eos: true,
  endInterpolation: true,
  extends: true,
  filter: true,
  id: true,
  include: true,
  indent: true,
  interpolation: true,
  isExpression: true,
  mixin: true,
  mixinBlock: true,
  path: true,
  pipelessText: true,
  prepend: true,
  slash: true,
  tag: true,
  text: true,
  textHtml: true,
  when: true,
  while: true,
  yield: true,
};

function checkDirectCalls(node) {
  const {callee} = node;
  if (callee.type !== 'MemberExpression') return;
  if (callee.object.type !== 'ThisExpression') return;
  const {property} = callee;
  let func;
  if (callee.computed) {
    if (property.type !== 'Literal') return;
    func = property.value;
  } else {
    func = property.name;
  }
  if (!lexerFunctions[func]) return;
  console.log(
    `index.js:${node.loc.start.line}:${node.loc.start.column}: Lexer function ${func} called directly`
  );
  hadErrors = true;
}

function checkMissingLexerFunction(node) {
  const {callee} = node;
  if (callee.type !== 'MemberExpression') return;
  if (callee.object.type !== 'ThisExpression') return;
  const {property} = callee;
  let func;
  if (callee.computed) {
    if (property.type !== 'Literal') return;
    func = property.value;
  } else {
    func = property.name;
  }
  if (func !== 'callLexerFunction') return;
  if (!node.arguments.length) return;
  if (node.arguments[0].type !== 'Literal') return;
  func = node.arguments[0].value;
  if (lexerFunctions[func]) return;
  console.log(
    `index.js:${node.loc.start.line}:${node.loc.start.column}: Lexer function ${func} not in lexerFunctions list`
  );
  hadErrors = true;
}
test('lexer functions', () => {
  const str = fs.readFileSync(`${__dirname}/../index.js`, 'utf8');
  const ast = acorn.parse(str, {locations: true});
  walk.simple(ast, {
    CallExpression(node) {
      checkDirectCalls(node);
      checkMissingLexerFunction(node);
    },
  });
  if (hadErrors) {
    throw new Error('Problem with lexer functions detected');
  }
});
