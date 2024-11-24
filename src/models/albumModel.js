import mongoose from "mongoose";

const albumSchema = new mongoose.Schema({
    name: { type: String, require: true },
    artistId: { type: mongoose.Schema.Types.ObjectId, ref: 'artist' },
    bgColour: { type: String, require: true },
    releaseYear: { type: String, require: true },
    image: { type: String, require: true },
    songs: [
        { type: mongoose.Schema.Types.ObjectId, ref: 'song' }
    ]
}, { timestamps: true })

const albumModel = mongoose.models.album || mongoose.model("album", albumSchema)

export default albumModel