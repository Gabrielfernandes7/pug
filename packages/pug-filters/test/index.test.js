const fs = require('fs');
const assert = require('assert');
const {handleFilters} = require('..');
const customFilters = require('./custom-filters.js');

process.chdir(`${__dirname}/../`);

let testCases;

testCases = fs
  .readdirSync(`${__dirname}/cases`)
  .filter((name) => /\.input\.json$/.test(name));
//
testCases.forEach((filename) => {
  function read(path) {
    return fs.readFileSync(`${__dirname}/cases/${path}`, 'utf8');
  }

  test(`cases/${filename}`, () => {
    const actualAst = JSON.stringify(
      handleFilters(JSON.parse(read(filename)), customFilters),
      null,
      '  '
    );
    expect(actualAst).toMatchSnapshot();
  });
});

testCases = fs
  .readdirSync(`${__dirname}/errors`)
  .filter((name) => /\.input\.json$/.test(name));

testCases.forEach((filename) => {
  function read(path) {
    return fs.readFileSync(`${__dirname}/errors/${path}`, 'utf8');
  }

  test(`errors/${filename}`, () => {
    let actual;
    try {
      handleFilters(JSON.parse(read(filename)), customFilters);
      throw new Error(`Expected ${filename} to throw an exception.`);
    } catch (ex) {
      if (!ex || !ex.code || ex.code.indexOf('PUG:') !== 0) throw ex;
      actual = {
        msg: ex.msg,
        code: ex.code,
        line: ex.line,
      };
    }
    expect(actual).toMatchSnapshot();
  });
});
