const fs = require('fs');
const assert = require('assert');
const lex = require('..');

const dir = `${__dirname}/cases/`;
fs.readdirSync(dir).forEach((testCase) => {
  if (/\.pug$/.test(testCase)) {
    test(testCase, () => {
      const result = lex(fs.readFileSync(dir + testCase, 'utf8'), {
        filename: dir + testCase,
      });
      expect(result).toMatchSnapshot();
    });
  }
});

const edir = `${__dirname}/errors/`;
fs.readdirSync(edir).forEach((testCase) => {
  if (/\.pug$/.test(testCase)) {
    test(testCase, () => {
      let actual;
      try {
        lex(fs.readFileSync(edir + testCase, 'utf8'), {
          filename: edir + testCase,
        });
        throw new Error(`Expected ${testCase} to throw an exception.`);
      } catch (ex) {
        if (!ex || !ex.code || ex.code.indexOf('PUG:') !== 0) throw ex;
        actual = {
          msg: ex.msg,
          code: ex.code,
          line: ex.line,
          column: ex.column,
        };
      }
      expect(actual).toMatchSnapshot();
    });
  }
});
