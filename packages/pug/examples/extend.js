/**
 * Module dependencies.
 */

const pug = require('..');

const path = `${__dirname}/extend.pug`;
const str = require('fs').readFileSync(path, 'utf8');

const fn = pug.compile(str, {filename: path, pretty: true});

const tobi = {name: 'tobi', age: 2};
const loki = {name: 'loki', age: 1};
const jane = {name: 'jane', age: 5};

console.log(
  fn({
    title: 'pets',
    pets: [tobi, loki, jane],
  })
);
