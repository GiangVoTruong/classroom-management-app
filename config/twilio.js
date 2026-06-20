const twilio = require('twilio')
const { toE164 } = require('../utils/phone')
const { envSecret } = require('../utils/secret')

let client = null

function getClient() {
  if (!client) {
    const accountSid = envSecret('TWILIO_ACCOUNT_SID')
    const authToken = envSecret('TWILIO_AUTH_TOKEN')
    if (!accountSid || !authToken) {
      throw new Error('TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN are required')
    }
    client = twilio(accountSid, authToken)
  }
  return client
}

function getVerifyServiceSid() {
  const sid = process.env.TWILIO_VERIFY_SERVICE_SID
  if (!sid) throw new Error('TWILIO_VERIFY_SERVICE_SID is required')
  return sid
}

async function sendVerification(phoneNumber) {
  await getClient()
    .verify.v2.services(getVerifyServiceSid())
    .verifications.create({ to: toE164(phoneNumber), channel: 'sms' })
}

async function checkVerification(phoneNumber, code) {
  const check = await getClient()
    .verify.v2.services(getVerifyServiceSid())
    .verificationChecks.create({ to: toE164(phoneNumber), code })

  return check.status === 'approved'
}

module.exports = { sendVerification, checkVerification }
