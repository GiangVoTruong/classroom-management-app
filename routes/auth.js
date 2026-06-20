const express = require('express')
const { asyncHandler } = require('../utils/asyncHandler')
const { requestPhoneAccessCode, verifyPhoneLogin } = require('../services/authService')

const router = express.Router()

router.post(
  '/createAccessCode',
  asyncHandler(async (req, res) => {
    const { phoneNumber } = req.body
    if (!phoneNumber) return res.status(400).json({ error: 'phoneNumber is required' })

    const { devCode } = await requestPhoneAccessCode(phoneNumber)
    const response = { success: true, message: 'Access code sent' }
    if (devCode) response.devCode = devCode
    res.json(response)
  }),
)

router.post(
  '/validateAccessCode',
  asyncHandler(async (req, res) => {
    const { phoneNumber, accessCode } = req.body
    if (!phoneNumber || !accessCode) {
      return res.status(400).json({ error: 'phoneNumber and accessCode are required' })
    }

    const { valid, userType } = await verifyPhoneLogin(phoneNumber, accessCode)
    if (!valid) return res.status(401).json({ error: 'Invalid access code' })
    if (!userType) return res.status(404).json({ error: 'Phone number not registered' })

    res.json({ success: true, userType })
  }),
)

module.exports = router
