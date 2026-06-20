const { getDb } = require('../config/firebase')
const { normalizePhone } = require('../utils/phone')

function getChatRoomId(phone1, phone2) {
  return [normalizePhone(phone1), normalizePhone(phone2)].sort().join('_')
}

function setupChat(io) {
  io.on('connection', (socket) => {
    socket.on('join', ({ phone, role }) => {
      socket.phone = phone
      socket.role = role
      socket.join(`user:${normalizePhone(phone)}`)
    })

    socket.on('sendMessage', async ({ from, to, text }) => {
      if (!from || !to || !text) {
        socket.emit('error', { message: 'from, to, and text are required' })
        return
      }

      const message = {
        from: normalizePhone(from),
        to: normalizePhone(to),
        text,
        timestamp: new Date().toISOString(),
      }

      try {
        const chatRoomId = getChatRoomId(from, to)
        await getDb().collection('messages').doc(chatRoomId).collection('chat').add(message)
      } catch (error) {
        console.error('Failed to persist message:', error)
      }

      io.to(`user:${message.to}`).emit('receiveMessage', message)
      socket.emit('messageSent', message)
    })

    socket.on('getHistory', async ({ phone1, phone2 }, callback) => {
      try {
        const chatRoomId = getChatRoomId(phone1, phone2)
        const snapshot = await getDb()
          .collection('messages')
          .doc(chatRoomId)
          .collection('chat')
          .orderBy('timestamp', 'asc')
          .get()

        callback?.({ messages: snapshot.docs.map((doc) => doc.data()) })
      } catch (error) {
        console.error('getHistory error:', error)
        callback?.({ error: error.message })
      }
    })
  })
}

module.exports = { setupChat, getChatRoomId }
