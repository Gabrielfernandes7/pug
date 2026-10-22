/**
 * Module dependencies.
 */

const pug = require('..');

const path = `${__dirname}/form.pug`;
const str = require('fs').readFileSync(path, 'utf8');

const fn = pug.compile(str, {filename: path, pretty: true});

const user = {
  name: 'TJ',
  email: 'tj@vision-media.ca',
  city: 'Victoria',
  province: 'BC',
};

console.log(fn({user}));
