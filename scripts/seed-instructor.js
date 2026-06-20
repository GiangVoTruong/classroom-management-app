require('dotenv').config()

const { initFirebase, getDb } = require('../config/firebase')
const { normalizePhone } = require('../utils/phone')

async function seed() {
  initFirebase()

  const phone = normalizePhone(process.env.INSTRUCTOR_PHONE || '1234567890')
  const instructor = {
    name: process.env.INSTRUCTOR_NAME || 'Demo Instructor',
    phone,
    email: process.env.INSTRUCTOR_EMAIL || 'instructor@example.com',
    createdAt: new Date().toISOString(),
  }

  await getDb().collection('instructors').doc(phone).set(instructor)
  console.log('Instructor seeded:', instructor)
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
