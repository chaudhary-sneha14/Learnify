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

const app=express()

app.use(cors())
app.use(clerkMiddleware())
app.use(express.json())
await connectDB()
await connectCloudinary()

app.get('/',(req,res)=>{
    res.send("Hello")
})
app.post('/clerk',express.json(),clerkWebhooks)
app.use('/api/educator',educatorRouter)
app.use('/api/course', courseRouter);
app.use('/api/user', userRouter);
app.post('/stripe', express.raw({type: 'application/json'}), stripeWebhooks);




const PORT=5000;
app.listen(process.env.PORT||5000 ,console.log(`Running on port ${PORT}`))