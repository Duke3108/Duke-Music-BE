import mongoose from "mongoose";

const playlistSchema = new mongoose.Schema({
    name: { type: String },
    desc: { type: String, default: "" },
    imageUrl: { type: String, default: "" },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'client' },
    songs: [
        { type: mongoose.Schema.Types.ObjectId, ref: 'song' }
    ],
}, { timestamps: true });

playlistSchema.pre('save', async function (next) {
    if (!this.name) {
        const count = await mongoose.models.playlist.countDocuments({ ownerId: this.ownerId });
        this.name = `Danh sách phát của tôi #${count + 1}`;
    }
    next();
});

const playlistModel = mongoose.models.playlist || mongoose.model("playlist", playlistSchema);

export default playlistModel;