const nodemailer = require('nodemailer')

let transporter = null

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    })
  }
  return transporter
}

async function sendMail({ to, subject, text, html }) {
  await getTransporter().sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject,
    text,
    html,
  })
}

async function sendAccessCodeEmail(email, code) {
  await sendMail({
    to: email,
    subject: 'Your login code',
    text: `Your login code is:\n\n${code}`,
    html: `<p>Your login code is:</p><p><strong>${code}</strong></p>`,
  })
}

async function sendWelcomeEmail(email, name, setupLink) {
  await sendMail({
    to: email,
    subject: 'Setup your account',
    text: `Hello ${name},\n\nClick the link below to setup your account:\n\n${setupLink}`,
    html: `<p>Hello ${name},</p><p>Click the link below to setup your account:</p><p><a href="${setupLink}">${setupLink}</a></p>`,
  })
}

module.exports = { sendAccessCodeEmail, sendWelcomeEmail }
