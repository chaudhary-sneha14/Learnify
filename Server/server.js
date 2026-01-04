import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './Config/mongodb.js'
import { clerkWebhooks } from './Controller/webhooks.js'

const app=express()

app.use(cors())
app.use(express.json())
connectDB()

app.get('/',(req,res)=>{
    res.send("Hello")
})
app.post('/clerk',express.json(),clerkWebhooks)



const PORT=5000;
app.listen(process.env.PORT||5000 ,console.log(`Running on port ${PORT}`))