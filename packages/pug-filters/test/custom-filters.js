const assert = require('assert');

module.exports = {
  custom(str, options) {
    expect(options.opt).toBe('val');
    expect(options.num).toBe(2);
    return `BEGIN${str}END`;
  },
};
