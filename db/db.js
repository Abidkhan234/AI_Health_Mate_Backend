import mongoose from 'mongoose'
import 'dotenv/config'

mongoose.connect(process.env.DB_URL, {
    serverSelectionTimeoutMS: 60000, // 60 seconds for server selection
    socketTimeoutMS: 120000, // 120 seconds for operations
    connectTimeoutMS: 60000, // 60 seconds to establish connection
})

export default mongoose