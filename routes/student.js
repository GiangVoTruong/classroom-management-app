const express = require('express');
const bcrypt = require('bcryptjs');
const { getDb } = require('../config/firebase');
const { generateAccessCode } = require('../utils/generateCode');
const { normalizePhone } = require('../utils/phone');
const { asyncHandler } = require('../utils/asyncHandler');
const {
  toStudentProfile,
  findStudentByPhone,
  findStudentByEmail,
  findStudentByField,
} = require('../services/studentService');
const { sendAccessCodeEmail } = require('../config/email');
const { normalizeEmail } = require('../utils/email');
const { signStudentToken } = require('../utils/jwt');

const router = express.Router();

async function saveEmailAccessCode(email, code) {
  await getDb().collection('emailAccessCodes').doc(email).set({
    email,
    code,
    createdAt: new Date().toISOString(),
  });
}

async function getEmailAccessCode(email) {
  const doc = await getDb().collection('emailAccessCodes').doc(email).get();
  return doc.exists ? doc : null;
}

router.get(
  '/setup/:token',
  asyncHandler(async (req, res) => {
    const student = await findStudentByField('setupToken', req.params.token);

    if (!student) {
      return res.status(404).json({ error: 'Invalid or expired setup link' });
    }

    if (student.data.accountSetup) {
      return res.status(400).json({ error: 'Account already set up' });
    }

    res.json({ name: student.data.name, email: student.data.email });
  }),
);

async function generateUsernameFromEmail(email) {
  const base = email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '') || 'student';
  let candidate = base;
  let suffix = 1;

  while (await findStudentByField('username', candidate)) {
    candidate = `${base}${suffix}`;
    suffix += 1;
  }

  return candidate;
}

const setupAccountHandler = asyncHandler(async (req, res) => {
  const { token, password } = req.body;

  if (!token || !password) {
    return res.status(400).json({ error: 'token and password are required' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  const student = await findStudentByField('setupToken', token);

  if (!student) {
    return res.status(404).json({ error: 'Invalid setup link' });
  }

  if (student.data.accountSetup) {
    return res.status(400).json({ error: 'Account already set up' });
  }

  const username = await generateUsernameFromEmail(student.data.email);
  const passwordHash = await bcrypt.hash(password, 10);

  await student.ref.update({
    username,
    passwordHash,
    accountSetup: true,
    setupToken: '',
  });

  res.json({ success: true, student: toStudentProfile({ ...student.data, username, accountSetup: true }) });
});

router.post('/setupAccount', setupAccountHandler);
router.post('/setup-account', setupAccountHandler);

router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'username and password are required' });
    }

    const student = await findStudentByField('username', username);

    if (!student || !student.data.accountSetup || !student.data.passwordHash) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const valid = await bcrypt.compare(password, student.data.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const profile = toStudentProfile(student.data);
    const token = signStudentToken(profile);

    res.json({ success: true, token, role: 'student', student: profile });
  }),
);

const loginEmailHandler = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'email is required' });
  }

  const emailNorm = normalizeEmail(email);
  const student = await findStudentByEmail(emailNorm);

  if (!student) {
    return res.status(404).json({
      error: 'Student not found with this email. Ask your instructor to add you first.',
    });
  }

  if (!student.data.accountSetup) {
    return res.status(400).json({
      error: 'Account not set up yet. Check your email for the setup link.',
    });
  }

  const code = generateAccessCode();
  await saveEmailAccessCode(emailNorm, code);
  await sendAccessCodeEmail(emailNorm, code);

  res.json({ success: true, message: 'Access code sent to email' });
});

router.post('/loginEmail', loginEmailHandler);
router.post('/LoginEmail', loginEmailHandler);

const validateAccessCodeHandler = asyncHandler(async (req, res) => {
  const { accessCode, email } = req.body;

  if (!accessCode || !email) {
    return res.status(400).json({ error: 'accessCode and email are required' });
  }

  const emailNorm = normalizeEmail(email);
  const student = await findStudentByEmail(emailNorm);

  if (!student) {
    return res.status(404).json({ error: 'Student not found' });
  }

  const codeDoc = await getEmailAccessCode(emailNorm);
  if (!codeDoc || codeDoc.data().code !== accessCode) {
    return res.status(401).json({ error: 'Invalid access code' });
  }

  await codeDoc.ref.update({ code: '' });

  const profile = toStudentProfile(student.data);
  const token = signStudentToken(profile);

  res.json({ success: true, token, role: 'student', student: profile });
});

router.post('/validateAccessCode', validateAccessCodeHandler);
router.post('/ValidateAccessCode', validateAccessCodeHandler);

router.get(
  '/myLessons',
  asyncHandler(async (req, res) => {
    const { phone } = req.query;

    if (!phone) {
      return res.status(400).json({ error: 'phone query parameter is required' });
    }

    const student = await findStudentByPhone(phone);

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.json({ lessons: student.data.lessons || [] });
  }),
);

router.post(
  '/markLessonDone',
  asyncHandler(async (req, res) => {
    const { phone, lessonId } = req.body;

    if (!phone || !lessonId) {
      return res.status(400).json({ error: 'phone and lessonId are required' });
    }

    const student = await findStudentByPhone(phone);

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const lessons = student.data.lessons || [];
    const lessonIndex = lessons.findIndex((l) => l.id === lessonId);

    if (lessonIndex === -1) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    lessons[lessonIndex] = {
      ...lessons[lessonIndex],
      completed: true,
      completedAt: new Date().toISOString(),
    };

    await student.ref.update({ lessons });
    res.json({ success: true, lesson: lessons[lessonIndex] });
  }),
);

router.put(
  '/editProfile',
  asyncHandler(async (req, res) => {
    const { phone, newPhone, name, email } = req.body;

    if (!phone) {
      return res.status(400).json({ error: 'phone is required' });
    }

    const student = await findStudentByPhone(phone);

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const normalized = normalizePhone(phone);
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (email !== undefined) updates.email = normalizeEmail(email);

    const nextPhone = newPhone !== undefined ? normalizePhone(newPhone) : normalized;

    if (newPhone !== undefined && nextPhone !== normalized) {
      const existing = await findStudentByPhone(nextPhone);
      if (existing) {
        return res.status(409).json({ error: 'Phone number already in use' });
      }

      await getDb().collection('students').doc(nextPhone).set({
        ...student.data,
        ...updates,
        phone: nextPhone,
      });
      await student.ref.delete();

      return res.json({
        success: true,
        profile: {
          name: updates.name ?? student.data.name,
          phone: nextPhone,
          email: updates.email ?? student.data.email,
        },
      });
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    await student.ref.update(updates);
    const updated = (await student.ref.get()).data();

    res.json({ success: true, profile: toStudentProfile(updated) });
  }),
);

module.exports = router;
