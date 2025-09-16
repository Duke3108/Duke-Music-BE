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
import clientRoute from './src/routes/clientRoute.js'
import playlistRouter from './src/routes/playlistRoute.js'
import artistRouter from './src/routes/artistRouter.js'

//app config
const app = express()
const port = process.env.PORT || 4000
connectDB()
connectCloudinary()

const allowedOrigins = [
    process.env.CLIENT_URL_1 || 'http://localhost:5173',
    process.env.CLIENT_URL_2 || 'http://localhost:5174',
    'https://duke-music-admin-fe.vercel.app',
    'https://duke-music-client-fe.vercel.app',
];

// CORS configuration
const corsOptions = {
    origin: (origin, callback) => {
        if (allowedOrigins.includes(origin) || !origin) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
};

//middlewares
app.use(cors(corsOptions))
app.use(cookieParser())
app.use(express.json())

//routes
app.use('/api/song', songRouter)
app.use('/api/album', albumRouter)
app.use('/api/client', clientRoute)
app.use('/api/playlist', playlistRouter)
app.use('/api/artist', artistRouter)
app.use('/v1/auth', authRoute)
app.use('/v1/user', userRouter)

app.get('/', (req, res) => res.send("API Working"))

app.listen(port, () => console.log(`Server started on ${port}`))