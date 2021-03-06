const crypto = require( "crypto" );

const SaltLength = 9;

function createHash(password) {
  const salt = generateSalt(SaltLength);
  const hash = md5(password + salt);
  return salt + hash ;
}

function validateHash(hash, password) {
  const salt = hash.substr(0, SaltLength);
  const validHash = salt + md5(password + salt);
  return hash === validHash;
}

function generateSalt(len) {
  var set = '0123456789abcdefghijklmnopqurstuvwxyzABCDEFGHIJKLMNOPQURSTUVWXYZ',
      setLen = set.length,
      salt = '';
  for (var i = 0; i < len; i++) {
    var p = Math.floor(Math.random() * setLen);
    salt += set[p];
  }
  return salt;
}

function md5(string) {
  return crypto.createHash('md5').update(string).digest('hex');
}

module.exports = {
  'hash': createHash,
  'validate': validateHash
};
