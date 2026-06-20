require('dotenv').config()

const express = require('express')
const http = require('http')
const cors = require('cors')
const { Server } = require('socket.io')

const { initFirebase } = require('./config/firebase')
const authRoutes = require('./routes/auth')
const instructorRoutes = require('./routes/instructor')
const studentRoutes = require('./routes/student')
const { setupChat } = require('./socket/chat')

const app = express()
const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
})

initFirebase()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/', (_req, res) => res.json({ message: 'Express API is running' }))
app.use('/', authRoutes)
app.use('/', instructorRoutes)
app.use('/student', studentRoutes)

app.use((err, _req, res, _next) => {
  console.error(err)
  res.status(500).json({ error: err.message || 'Internal server error' })
})

setupChat(io)

const PORT = process.env.PORT || 3000
server.listen(PORT, () => console.log(`Server running on port ${PORT}`))

module.exports = { app, server, io }
