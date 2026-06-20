const { generateAccessCode } = require('../utils/generateCode')
const { normalizePhone } = require('../utils/phone')
const { isSmsDevMode } = require('../utils/env')
const { sendVerification, checkVerification } = require('../config/twilio')
const { getDb } = require('../config/firebase')

async function getUserType(phone) {
  const id = normalizePhone(phone)
  const db = getDb()

  if ((await db.collection('instructors').doc(id).get()).exists) return 'instructor'
  if ((await db.collection('students').doc(id).get()).exists) return 'student'
  return null
}

async function saveDevAccessCode(phone, code) {
  const normalized = normalizePhone(phone)
  await getDb().collection('accessCodes').doc(normalized).set({
    phoneNumber: normalized,
    accessCode: code,
    createdAt: new Date().toISOString(),
  })
}

async function verifyDevAccessCode(phone, accessCode) {
  const normalized = normalizePhone(phone)
  const doc = await getDb().collection('accessCodes').doc(normalized).get()

  if (!doc.exists || doc.data().accessCode !== accessCode) {
    return { valid: false, userType: null }
  }

  await doc.ref.update({ accessCode: '' })
  return { valid: true, userType: await getUserType(normalized) }
}

async function requestPhoneAccessCode(phoneNumber) {
  if (isSmsDevMode()) {
    const code = generateAccessCode()
    await saveDevAccessCode(phoneNumber, code)
    console.log(`[SMS_DEV_MODE] Access code for ${normalizePhone(phoneNumber)}: ${code}`)
    return { devCode: code }
  }

  await sendVerification(phoneNumber)
  return {}
}

async function verifyPhoneLogin(phoneNumber, accessCode) {
  if (isSmsDevMode()) {
    return verifyDevAccessCode(phoneNumber, accessCode)
  }

  const valid = await checkVerification(phoneNumber, accessCode)
  if (!valid) return { valid: false, userType: null }

  return { valid: true, userType: await getUserType(phoneNumber) }
}

module.exports = { requestPhoneAccessCode, verifyPhoneLogin }
