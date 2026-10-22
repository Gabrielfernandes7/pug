/**
 * Module dependencies.
 */

const pug = require('..');

const path = `${__dirname}/rss.pug`;
const str = require('fs').readFileSync(path, 'utf8');

const fn = pug.compile(str, {filename: path, pretty: true});

const items = [];

items.push({
  title: 'Example',
  description: 'Something',
  link: 'http://google.com',
});
items.push({
  title: 'LearnBoost',
  description: 'Cool',
  link: 'http://learnboost.com',
});
items.push({
  title: 'Express',
  description: 'Cool',
  link: 'http://expressjs.com',
});

console.log(fn({items}));
