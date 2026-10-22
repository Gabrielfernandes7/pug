const assert = require('assert');
const lex = require('pug-lexer');
const parse = require('pug-parser');
const walk = require('..');

test('simple', () => {
  const ast = walk(
    parse(lex('.my-class foo')),
    (node, replace) => {
      // called before walking the children of `node`
      // to replace the node, call `replace(newNode)`
      // return `false` to skip descending
      if (node.type === 'Text') {
        replace({
          type: 'Text',
          val: 'bar',
          line: node.line,
          column: node.column,
        });
      }
    },
    (node, replace) => {
      // called before walking the children of `node`
      // to replace the node, call `replace(newNode)`
    }
  );
  expect(ast).toEqual(parse(lex('.my-class bar')));
});

describe('replace([])', () => {
  test('block flattening', () => {
    const called = [];
    const ast = walk(
      {
        type: 'Block',
        nodes: [
          {
            type: 'Block',
            nodes: [
              {
                type: 'Block',
                nodes: [
                  {
                    type: 'Text',
                    val: 'a',
                  },
                  {
                    type: 'Text',
                    val: 'b',
                  },
                ],
              },
              {
                type: 'Text',
                val: 'c',
              },
            ],
          },
          {
            type: 'Text',
            val: 'd',
          },
        ],
      },
      (node, replace) => {
        if (node.type === 'Text') {
          called.push(`before ${node.val}`);
          if (node.val === 'a') {
            assert(replace.arrayAllowed, 'replace.arrayAllowed set wrongly');
            replace([
              {
                type: 'Text',
                val: 'e',
              },
              {
                type: 'Text',
                val: 'f',
              },
            ]);
          }
        }
      },
      (node, replace) => {
        if (node.type === 'Block' && replace.arrayAllowed) {
          replace(node.nodes);
        } else if (node.type === 'Text') {
          called.push(`after ${node.val}`);
        }
      }
    );

    expect(ast).toEqual({
      type: 'Block',
      nodes: [
        {type: 'Text', val: 'e'},
        {type: 'Text', val: 'f'},
        {type: 'Text', val: 'b'},
        {type: 'Text', val: 'c'},
        {type: 'Text', val: 'd'},
      ],
    });

    assert.deepEqual(
      called,
      [
        'before a',

        'before e',
        'after e',

        'before f',
        'after f',

        'before b',
        'after b',

        'before c',
        'after c',

        'before d',
        'after d',
      ],
      `before() and after() called incorrectly: ${JSON.stringify(called)}`
    );
  });

  test('adding include filters', () => {
    const ast = walk(
      parse(lex('include:filter1:filter2 file')),
      (node, replace) => {
        if (node.type === 'IncludeFilter') {
          assert(replace.arrayAllowed);
          if (node.name === 'filter1') {
            const firstFilter = 'filter3';

            replace([
              {
                type: 'IncludeFilter',
                name: firstFilter,
                attrs: [],
                line: node.line,
                column: node.column,
              },
              {
                type: 'IncludeFilter',
                name: 'filter4',
                attrs: [],
                line: node.line,
                column: node.column + firstFilter.length + 1,
              },
            ]);
          } else if (node.name === 'filter2') {
            replace([]);
          }
        }
      }
    );

    expect(ast).toEqual(parse(lex('include:filter3:filter4 file')));
  });

  test('fails when parent is not Block', () => {
    walk(parse(lex('p content')), (node, replace) => {
      if (
        node.type === 'Block' &&
        node.nodes[0] &&
        node.nodes[0].type === 'Text'
      ) {
        assert(!replace.arrayAllowed, 'replace.arrayAllowed set wrongly');
        assert.throws(() => {
          replace([]);
        });
      }
    });
  });
});
