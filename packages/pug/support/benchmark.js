/**
 * Module dependencies.
 */

const uubench = require('uubench');
const pug = require('..');

const suite = new uubench.Suite({
  min: 200,
  result(name, stats) {
    const persec = 1000 / stats.elapsed;
    const ops = stats.iterations * persec;
    console.log('%s: %d', name, ops | 0);
  },
});

function setup(self) {
  const suffix = self ? ' (self)' : '';
  const options = {self};

  let str = 'html\n  body\n    h1 Title';
  const fn = pug.compile(str, options);

  suite.bench(`tiny${suffix}`, (next) => {
    fn();
    next();
  });

  str =
    '\
html\n\
  body\n\
    h1 Title\n\
    ul#menu\n\
      li: a(href="#") Home\n\
      li: a(href="#") About Us\n\
      li: a(href="#") Store\n\
      li: a(href="#") FAQ\n\
      li: a(href="#") Contact\n\
';

  const fn2 = pug.compile(str, options);

  suite.bench(`small${suffix}`, (next) => {
    fn2();
    next();
  });

  str =
    '\
html\n\
  body\n\
    h1 #{title}\n\
    ul#menu\n\
      - each link in links\r\n\
        li: a(href="#")= link\r\n\
';

  if (self) {
    str =
      '\
html\n\
  body\n\
    h1 #{self.title}\n\
    ul#menu\n\
      - each link in self.links\r\n\
        li: a(href="#")= link\r\n\
';
  }

  const fn3 = pug.compile(str, options);

  suite.bench(`small locals${suffix}`, (next) => {
    fn3({
      title: 'Title',
      links: ['Home', 'About Us', 'Store', 'FAQ', 'Contact'],
    });
    next();
  });

  str =
    '\
html\n\
  body\n\
    h1 Title\n\
    ul#menu\n\
      li: a(href="#") Home\n\
      li: a(href="#") About Us\n\
      li: a(href="#") Store\n\
      li: a(href="#") FAQ\n\
      li: a(href="#") Contact\n\
';

  str = Array(30).join(str);
  const fn4 = pug.compile(str, options);

  suite.bench(`medium${suffix}`, (next) => {
    fn4();
    next();
  });

  str =
    '\
html\n\
  body\n\
    h1 Title\n\
    ul#menu\n\
      li: a(href="#") Home\n\
      li: a(href="#") About Us\n\
      li: a(href="#") Store\n\
      li: a(href="#") FAQ\n\
      li: a(href="#") Contact\n\
';

  str = Array(100).join(str);
  const fn5 = pug.compile(str, options);

  suite.bench(`large${suffix}`, (next) => {
    fn5();
    next();
  });
}

setup();
setup(true);

suite.run();
