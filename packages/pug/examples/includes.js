/**
 * Module dependencies.
 */

const pug = require('..');

const path = `${__dirname}/includes.pug`;
const str = require('fs').readFileSync(path, 'utf8');

const fn = pug.compile(str, {filename: path, pretty: true});

console.log(fn());
