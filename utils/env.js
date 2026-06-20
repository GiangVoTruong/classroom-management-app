function isSmsDevMode() {
  return process.env.SMS_DEV_MODE === 'true';
}

module.exports = { isSmsDevMode };
