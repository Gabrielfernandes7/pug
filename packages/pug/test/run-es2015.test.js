const fs = require('fs');
const assert = require('assert');
const mkdirp = require('mkdirp').sync;
const runUtils = require('./run-utils');
const pug = require('..');

const cases = runUtils.findCases(`${__dirname}/cases`);
const es2015 = runUtils.findCases(`${__dirname}/cases-es2015`);

mkdirp(`${__dirname}/output-es2015`);

describe('test cases for ECMAScript 2015', () => {
  try {
    eval('``');
    es2015.forEach(runUtils.testSingle.bind(null, it, '-es2015'));
  } catch (ex) {
    es2015.forEach(runUtils.testSingle.bind(null, it.skip, '-es2015'));
  }
});
