const assert = require('assert');
const fs = require('fs');
const link = require('..');

function testDir(dir) {
  fs.readdirSync(dir).forEach((name) => {
    if (!/\.input\.json$/.test(name)) return;
    test(name, () => {
      const actual = link(
        JSON.parse(fs.readFileSync(`${dir}/${name}`, 'utf8'))
      );
      expect(actual).toMatchSnapshot();
    });
  });
}

function testDirError(dir) {
  fs.readdirSync(dir).forEach((name) => {
    if (!/\.input\.json$/.test(name)) return;
    test(name, () => {
      const input = JSON.parse(fs.readFileSync(`${dir}/${name}`, 'utf8'));
      let err;
      try {
        link(input);
      } catch (ex) {
        err = {
          msg: ex.msg,
          code: ex.code,
          line: ex.line,
        };
      }
      if (!err) throw new Error('Expected error');
      expect(err).toMatchSnapshot();
    });
  });
}

describe('cases from pug', () => {
  testDir(`${__dirname}/cases`);
});

describe('special cases', () => {
  testDir(`${__dirname}/special-cases`);
});

describe('error handling', () => {
  testDirError(`${__dirname}/errors`);
});
