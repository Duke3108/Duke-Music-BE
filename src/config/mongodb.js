import mongoose from "mongoose";

const connectDB = async () => {

    mongoose.connection.on('connected', () => {
        console.log('CONNECTED TO MONGO')
    })

    await mongoose.connect(`${process.env.MONGODB_URL}/dukemusic`)
}

export default connectDB