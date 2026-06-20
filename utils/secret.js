function envSecret(name) {
  const b64 = process.env[`${name}_B64`];
  if (b64) return Buffer.from(b64, 'base64').toString('utf8');
  return process.env[name];
}

module.exports = { envSecret };
