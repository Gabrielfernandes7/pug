const pug = require('.');

const resolvedPug = JSON.stringify(require.resolve('./'));

function compileTemplate(module, filename) {
  const template = pug.compileFileClient(filename, {
    inlineRuntimeFunctions: false,
  });
  const body =
    `var pug = require(${resolvedPug}).runtime;\n\n` +
    `module.exports = ${template};`;
  module._compile(body, filename);
}

if (require.extensions) {
  require.extensions['.pug'] = compileTemplate;
}
