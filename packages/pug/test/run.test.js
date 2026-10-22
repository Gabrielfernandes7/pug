// even and odd tests are arbitrarily split because jest is faster that way

const fs = require('fs');
const assert = require('assert');
const mkdirp = require('mkdirp').sync;
const runUtils = require('./run-utils');
const pug = require('..');

const cases = runUtils.findCases(`${__dirname}/cases`);
const es2015 = runUtils.findCases(`${__dirname}/cases-es2015`);

mkdirp(`${__dirname}/output`);

describe('test cases', () => {
  cases.forEach((test, i) => {
    runUtils.testSingle(it, '', test);
  });
});
