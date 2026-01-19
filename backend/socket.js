const { Server } = require('socket.io')
const jwt = require('jsonwebtoken')

let ioInstance = null

const initSocket = (httpServer) => {
  ioInstance = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_ORIGIN || '*',
      credentials: true,
    },
  })

  const secret = process.env.JWT_SECRET

  ioInstance.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token
      if (!token) {
        return next(new Error('Unauthorized'))
      }

      if (!secret) {
        return next(new Error('JWT secret is not configured'))
      }

      const decoded = jwt.verify(token, secret)
      socket.user = { id: decoded.id, role: decoded.role }
      socket.join(`user:${decoded.id}`)
      return next()
    } catch (error) {
      return next(new Error('Unauthorized'))
    }
  })

  ioInstance.on('connection', (socket) => {
    socket.on('joinConversation', (conversationId) => {
      if (conversationId) {
        socket.join(`conversation:${conversationId}`)
      }
    })

    socket.on('leaveConversation', (conversationId) => {
      if (conversationId) {
        socket.leave(`conversation:${conversationId}`)
      }
    })
  })

  return ioInstance
}

const getSocket = () => ioInstance

module.exports = {
  initSocket,
  getSocket,
}
