const fs = require('fs');
const assert = require('assert');
const lineJSON = require('line-json');
const strip = require('..');

const dir = `${__dirname}/cases/`;
fs.readdirSync(dir).forEach((testCase) => {
  if (/\.input\.json$/.test(testCase)) {
    test(testCase, () => {
      const stem = testCase.replace(/\.input\.json$/, '.');

      function test(name, options) {
        let input = fs.readFileSync(dir + testCase, 'utf8');
        input = lineJSON.parse(input);

        const result = strip(input, options);
        expect(result).toMatchSnapshot();
      }

      test('unbuffered');
      test('buffered', {stripBuffered: true, stripUnbuffered: false});
      test('both', {stripBuffered: true});
    });
  }
});

const edir = `${__dirname}/errors/`;
fs.readdirSync(edir).forEach((testCase) => {
  if (/\.input\.json$/.test(testCase)) {
    test(testCase, () => {
      const stem = testCase.replace(/\.input\.json$/, '.');

      let input = fs.readFileSync(edir + testCase, 'utf8');
      input = lineJSON.parse(input);

      try {
        strip(input);
        throw new Error(`Expected ${testCase} to throw an exception.`);
      } catch (ex) {
        if (!ex || !ex.code || ex.code.indexOf('PUG:') !== 0) throw ex;
        expect({
          msg: ex.msg,
          code: ex.code,
          line: ex.line,
        }).toMatchSnapshot();
      }
    });
  }
});
