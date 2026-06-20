const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'classroom-dev-secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

function signStudentToken(student) {
  return jwt.sign(
    {
      role: 'student',
      phone: student.phone,
      email: student.email,
      name: student.name,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN },
  );
}

module.exports = { signStudentToken };
