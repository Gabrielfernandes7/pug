/**
 * Module dependencies.
 */

const pug = require('..');

const path = `${__dirname}/mixins.pug`;
const str = require('fs').readFileSync(path, 'utf8');

const fn = pug.compile(str, {filename: path, pretty: true});

const user = {
  name: 'tj',
  pets: ['tobi', 'loki', 'jane', 'manny'],
};

console.log(fn({user}));
