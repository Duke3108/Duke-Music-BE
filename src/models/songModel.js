import mongoose from "mongoose";

const songSchema = new mongoose.Schema({
    name: {
        type: String,
        require: true
    },
    artistId: [
        { type: mongoose.Schema.Types.ObjectId, ref: 'artist' }
    ],
    albumId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'album'
    },
    image: {
        type: String,
        require: true
    },
    file: {
        type: String,
        require: true
    },
    duration: {
        type: String,
        require: true
    }
}, { timestamps: true })

const songModel = mongoose.models.song || mongoose.model("song", songSchema)

export default songModel