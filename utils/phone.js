function normalizePhone(phone) {
  return String(phone).replace(/\D/g, '')
}

function toE164(phone, countryCode = '84') {
  const digits = normalizePhone(phone)
  if (!digits) return ''
  if (digits.startsWith(countryCode)) return `+${digits}`
  if (digits.startsWith('0')) return `+${countryCode}${digits.slice(1)}`
  return `+${countryCode}${digits}`
}

module.exports = { normalizePhone, toE164 }
