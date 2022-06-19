const crypto = require('crypto-js');

module.exports = {
  encrypt: (text) =>
    Buffer.from(crypto.AES.encrypt(text, process.env.SECRET_KEY).toString()).toString('base64'),
  decrypt: (text) =>
    crypto.AES.decrypt(
      Buffer.from(text, 'base64').toString('utf8'),
      process.env.SECRET_KEY,
    ).toString(crypto.enc.Utf8),
};
