/**
 * Module dependencies.
 */

const pug = require('..');

pug.renderFile(`${__dirname}/layout.pug`, {debug: true}, (err, html) => {
  if (err) throw err;
  console.log(html);
});
