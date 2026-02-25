const mongoose = require('mongoose')

const connectDB = async () => {
  const uri = process.env.MONGO_URI

  if (!uri) {
    throw new Error('MONGO_URI is not configured')
  }

  try {
    await mongoose.connect(uri, {
      connectTimeoutMS: 60000,
      socketTimeoutMS: 60000,
      serverSelectionTimeoutMS: 30000,
    })

    console.log('✅ MongoDB connected successfully')
  } catch (error) {
    console.error('❌ Mongo connection error:', error.message)
    process.exit(1)
  }
}

module.exports = connectDB
