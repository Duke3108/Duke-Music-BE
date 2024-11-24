import mongoose from "mongoose";

const artistSchema = new mongoose.Schema({
    name: { type: String, require: true },
    avatar: {
        type: String, require: true
    },
    bg: {
        type: String, require: true
    },
    songs: [
        { type: mongoose.Schema.Types.ObjectId, ref: 'song' }
    ],
    albums: [
        { type: mongoose.Schema.Types.ObjectId, ref: 'album' }
    ]
}, { timestamps: true })

const artistModel = mongoose.models.artist || mongoose.model("artist", artistSchema)

export default artistModel