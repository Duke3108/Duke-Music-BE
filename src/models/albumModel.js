import mongoose from "mongoose";

const albumSchema = new mongoose.Schema({
    name: { type: String, require: true },
    desc: { type: String, require: true },
    bgColour: { type: String, require: true },
    image: { type: String, require: true },
})

const albumModel = mongoose.models.Album || mongoose.model("Album", albumSchema)

export default albumModel