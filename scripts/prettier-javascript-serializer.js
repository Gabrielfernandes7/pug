const prettier = require('prettier');

const prettierOptions = {parser: 'babel'};

// filename serializer that removes the basedir
module.exports = {
  test(val) {
    try {
      return (
        typeof val === 'string' &&
        /function /.test(val) &&
        val !== prettier.format(val, prettierOptions)
      );
    } catch (ex) {
      return false;
    }
  },
  print(val, serialize, indent) {
    return serialize(prettier.format(val, prettierOptions));
  },
};
