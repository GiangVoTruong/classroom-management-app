const { getDb } = require('../config/firebase');
const { normalizePhone } = require('../utils/phone');
const { normalizeEmail } = require('../utils/email');

function toStudentProfile(data) {
  return {
    name: data.name,
    phone: data.phone,
    email: data.email,
    username: data.username,
    accountSetup: data.accountSetup,
  };
}

async function findStudentByPhone(phone) {
  const ref = getDb().collection('students').doc(normalizePhone(phone));
  const doc = await ref.get();
  if (!doc.exists) return null;
  return { ref, data: doc.data() };
}

async function findStudentByEmail(email) {
  return findStudentByField('email', normalizeEmail(email));
}

async function findStudentByField(field, value) {
  const snapshot = await getDb()
    .collection('students')
    .where(field, '==', value)
    .limit(1)
    .get();
  if (snapshot.empty) return null;
  const doc = snapshot.docs[0];
  return { ref: doc.ref, data: doc.data() };
}

module.exports = { toStudentProfile, findStudentByPhone, findStudentByEmail, findStudentByField };
