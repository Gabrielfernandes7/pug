const fs = require('fs');
const parse = require('..');

const testCases = fs
  .readdirSync(`${__dirname}/cases`)
  .filter((name) => /\.tokens\.json$/.test(name));

function parseNewlineJson(str) {
  return str.split('\n').filter(Boolean).map(JSON.parse);
}

function read(path) {
  return fs.readFileSync(`${__dirname}/cases/${path}`, 'utf8');
}

testCases.forEach((filename) => {
  test(filename, () => {
    const actualAst = parse(parseNewlineJson(read(filename)), {
      filename,
    });
    expect(actualAst).toMatchSnapshot();
  });
});
