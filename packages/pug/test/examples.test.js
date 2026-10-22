const fs = require('fs');
const pug = require('..');

describe('examples', () => {
  fs.readdirSync(`${__dirname}/../examples`).forEach((example) => {
    if (/\.js$/.test(example)) {
      it(`${example} does not throw any error`, () => {
        const {log} = console;
        const err = console.error;
        console.log = function () {};
        console.error = function () {};
        try {
          require(`../examples/${example}`);
        } finally {
          console.log = log;
          console.error = err;
        }
      });
    }
  });
});
