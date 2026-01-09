import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './Config/mongodb.js'
import { clerkWebhooks, stripeWebhooks } from './Controller/webhooks.js'
import educatorRouter from './Routes/educatorRoute.js'
import { clerkMiddleware } from '@clerk/express'
import connectCloudinary from './Config/cloudinary.js'
import courseRouter from './Routes/courseRoute.js'
import userRouter from './Routes/userRoute.js'

const app = express()

app.use(cors())

// ✅ STRIPE WEBHOOK MUST COME BEFORE express.json()
app.post('/stripe', express.raw({ type: 'application/json' }), stripeWebhooks)

// Clerk middleware
app.use(clerkMiddleware())

// JSON parser for rest of app
app.use(express.json())

await connectDB()
await connectCloudinary()

app.get('/', (req, res) => {
  res.send("Hello")
})

// Clerk webhook (JSON is OK here)
app.post('/clerk', express.json(), clerkWebhooks)

app.use('/api/educator', educatorRouter)
app.use('/api/course', courseRouter)
app.use('/api/user', userRouter)

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Running on port ${PORT}`))
