const admin = require('firebase-admin')

let db = null

function initFirebase() {
  if (admin.apps.length > 0) {
    db = admin.firestore()
    return db
  }

  const raw = process.env.FIREBASE_SERVICE_ACCOUNT
  if (raw) {
    const serviceAccount = JSON.parse(raw)
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) })
  } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    admin.initializeApp({ credential: admin.credential.applicationDefault() })
  } else {
    throw new Error(
      'Firebase credentials missing. Set FIREBASE_SERVICE_ACCOUNT (JSON string) on Vercel, or GOOGLE_APPLICATION_CREDENTIALS locally.',
    )
  }

  db = admin.firestore()
  return db
}

function getDb() {
  if (!db) initFirebase()
  return db
}

module.exports = { initFirebase, getDb, admin }
