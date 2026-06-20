const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../config/firebase');
const { normalizePhone } = require('../utils/phone');
const { asyncHandler } = require('../utils/asyncHandler');
const { findStudentByPhone, findStudentByEmail } = require('../services/studentService');
const { sendWelcomeEmail } = require('../config/email');
const { normalizeEmail } = require('../utils/email');

const router = express.Router();

router.post(
  '/addStudent',
  asyncHandler(async (req, res) => {
    const { name, phone, email, role, address } = req.body;

    if (!name || !phone || !email) {
      return res.status(400).json({ error: 'name, phone, and email are required' });
    }

    const normalized = normalizePhone(phone);
    const emailNorm = normalizeEmail(email);
    const existing = await findStudentByPhone(normalized);

    if (existing) {
      return res.status(409).json({ error: 'Student already exists' });
    }

    const setupToken = uuidv4();
    const student = {
      name,
      phone: normalized,
      email: emailNorm,
      role: role?.trim() || 'student',
      address: address?.trim() || '',
      lessons: [],
      accessCode: '',
      setupToken,
      accountSetup: false,
      username: '',
      passwordHash: '',
      createdAt: new Date().toISOString(),
    };

    await getDb().collection('students').doc(normalized).set(student);

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const setupLink = `${frontendUrl}/setup-account?token=${setupToken}`;

    try {
      await sendWelcomeEmail(emailNorm, name, setupLink);
    } catch (emailErr) {
      console.error('Welcome email failed:', emailErr.message);
    }

    res.status(201).json({
      success: true,
      student: {
        name,
        phone: normalized,
        email: emailNorm,
        role: student.role,
        address: student.address,
      },
    });
  }),
);

router.post(
  '/assignLesson',
  asyncHandler(async (req, res) => {
    const { studentPhone, studentPhones, title, description } = req.body;
    const phones = studentPhones || (studentPhone ? [studentPhone] : []);

    if (!phones.length || !title || !description) {
      return res.status(400).json({
        error: 'studentPhone(s), title, and description are required',
      });
    }

    const lessonBase = {
      title,
      description,
      completed: false,
      assignedAt: new Date().toISOString(),
    };

    const results = [];

    for (const phone of phones) {
      const student = await findStudentByPhone(phone);

      if (!student) {
        results.push({ phone: normalizePhone(phone), success: false, error: 'Student not found' });
        continue;
      }

      const assignedLesson = { ...lessonBase, id: uuidv4() };
      const lessons = [...(student.data.lessons || []), assignedLesson];

      await student.ref.update({ lessons });
      results.push({ phone: student.data.phone, success: true, lessonId: assignedLesson.id });
    }

    res.status(201).json({ success: true, results });
  }),
);

router.get(
  '/students',
  asyncHandler(async (_req, res) => {
    const snapshot = await getDb().collection('students').get();

    const students = snapshot.docs.map((doc) => {
      const { name, phone, email, role, address, lessons = [], accountSetup } = doc.data();
      const total = lessons.length;
      const completed = lessons.filter((l) => l.completed).length;
      return {
        name,
        phone,
        email,
        role: role || 'student',
        address: address || '',
        accountSetup,
        lessonCount: total,
        completedCount: completed,
      };
    });

    res.json({ students });
  }),
);

router.get(
  '/student/:phone',
  asyncHandler(async (req, res) => {
    const student = await findStudentByPhone(req.params.phone);

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const { name, phone, email, role, address, lessons } = student.data;
    res.json({
      name,
      phone,
      email,
      role: role || 'student',
      address: address || '',
      lessons: lessons || [],
    });
  }),
);

router.put(
  '/editStudent/:phone',
  asyncHandler(async (req, res) => {
    const { name, email, role, address } = req.body;
    const student = await findStudentByPhone(req.params.phone);

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (email !== undefined) updates.email = normalizeEmail(email);
    if (role !== undefined) updates.role = role.trim() || 'student';
    if (address !== undefined) updates.address = address.trim();

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    await student.ref.update(updates);
    const updated = (await student.ref.get()).data();

    res.json({
      success: true,
      student: {
        name: updated.name,
        phone: updated.phone,
        email: updated.email,
        role: updated.role || 'student',
        address: updated.address || '',
        lessons: updated.lessons,
      },
    });
  }),
);

router.delete(
  '/student/:phone',
  asyncHandler(async (req, res) => {
    const student = await findStudentByPhone(req.params.phone);

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    await student.ref.delete();
    res.json({ success: true, message: 'Student removed' });
  }),
);

router.get(
  '/instructor',
  asyncHandler(async (_req, res) => {
    const snapshot = await getDb().collection('instructors').limit(1).get();

    if (snapshot.empty) {
      return res.status(404).json({ error: 'No instructor found' });
    }

    const { name, phone, email } = snapshot.docs[0].data();
    res.json({ name, phone, email });
  }),
);

module.exports = router;
