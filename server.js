import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import cookieParser from 'cookie-parser'
import songRouter from './src/routes/songRoute.js'
import connectDB from './src/config/mongodb.js'
import connectCloudinary from './src/config/cloudinary.js'
import albumRouter from './src/routes/albumRoute.js'
import authRoute from './src/routes/authRoute.js'
import userRouter from './src/routes/userRoute.js'

//app config
const app = express()
const port = process.env.PORT || 4000
connectDB()
connectCloudinary()

//middlewares
app.use(cors())
app.use(cookieParser())
app.use(express.json())

//routes
app.use('/api/song', songRouter)
app.use('/api/album', albumRouter)
app.use('/v1/auth', authRoute)
app.use('/v1/user', userRouter)

app.get('/', (req, res) => res.send("API Working"))

app.listen(port, () => console.log(`Server started on ${port}`))