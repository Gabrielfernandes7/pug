const crypto = require('crypto');

// Buffer serializer to reduce snapshot gore for Node Buffer type
module.exports = {
  test(val) {
    return val && Buffer.isBuffer(val);
  },
  print(val, serialize, indent) {
    const output = {
      type: 'Buffer',
      size: val.length,
      hash: crypto.createHash('md5').update(val).digest('hex'),
    };
    return serialize(output);
  },
};
