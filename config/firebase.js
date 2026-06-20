const admin = require('firebase-admin')

let db = null

function initFirebase() {
  if (admin.apps.length > 0) return admin.firestore()

  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
    : null

  if (serviceAccount) {
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) })
  } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    admin.initializeApp({ credential: admin.credential.applicationDefault() })
  } else {
    console.warn('Firebase: set FIREBASE_SERVICE_ACCOUNT or GOOGLE_APPLICATION_CREDENTIALS')
    admin.initializeApp()
  }

  db = admin.firestore()
  return db
}

function getDb() {
  return db || initFirebase()
}

module.exports = { initFirebase, getDb, admin }
