import { v2 as cloudinary } from 'cloudinary'
import songModel from '../models/songModel.js'
import albumModel from '../models/albumModel.js'
import artistModel from '../models/artistModel.js'
import mongoose from 'mongoose'

const addSong = async (req, res) => {
    try {

        if (!req.files || !req.files.audio[0] || !req.files.image[0]) {
            return res.status(400).json({
                message: "File hình hoặc audio chưa được upload"
            })
        }

        const { name, artistId, albumId } = req.body
        const audioFile = req.files.audio[0]
        const imageFile = req.files.image[0]
        const audioUpload = await cloudinary.uploader.upload(audioFile.path, { resource_type: "video" })
        const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" })
        const duration = `${Math.floor(audioUpload.duration / 60)}:${Math.floor(audioUpload.duration % 60)}`

        const songData = {
            name,
            image: imageUpload.secure_url,
            file: audioUpload.secure_url,
            duration,
            artistId: artistId || [],
            albumId: albumId || {}
        }

        const song = songModel(songData)
        await song.save()

        if (albumId) {
            await albumModel.findByIdAndUpdate(albumId, {
                $push: { songs: song._id }
            })
        }

        if (artistId) {
            await artistModel.findByIdAndUpdate(artistId, {
                $push: { songs: song._id }
            })
        }

        res.status(201).json({ message: "Thêm bài hát thành công", song })

    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error })
    }
}

const listSong = async (req, res) => {
    try {
        const allSongs = await songModel.find().sort({ createdAt: -1 }).populate('artistId')
        res.json({ success: true, songs: allSongs })
    } catch (error) {
        res.json({ success: false })
    }
}

const searchSong = async (req, res) => {
    try {
        const { name, artist, album } = req.query;


        const filter = {};

        if (name) {
            filter.name = { $regex: name, $options: "i" };
        }
        if (artist) {
            filter.artistId = artist;
        }
        if (album) {
            filter.albumId = album;
        }

        const songs = await songModel
            .find(filter)
            .sort({ createdAt: -1 })
            .populate('artistId')
            .populate('albumId')

        // Trả về kết quả
        res.json({ success: true, songs });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};


const removeSong = async (req, res) => {
    try {
        const song = await songModel.findById(req.body.id)

        if (song.albumId) {
            await albumModel.findByIdAndUpdate(albumId, {
                $pull: { songs: song._id }
            })
        }

        if (song.artistId) {
            await albumModel.findByIdAndUpdate(artistId, {
                $pull: { songs: song._id }
            })
        }

        await songModel.findByIdAndDelete(req.body.id)
        res.status(200).json({ message: "Đã xóa bài hát thành công" })
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error })
    }
}

const updateSong = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, artistId, albumId } = req.body;

        // Kiểm tra xem id bài hát có hợp lệ không
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid song id" });
        }

        // Tìm bài hát
        const song = await songModel.findById(id);
        if (!song) {
            return res.status(404).json({ message: "Bài hát không tồn tại" });
        }

        // Xử lý file upload
        let updatedAudioUrl = song.file;
        let updatedImageUrl = song.image;

        if (req.files) {
            if (req.files.audio && req.files.audio[0]) {
                const audioFile = req.files.audio[0];
                const audioUpload = await cloudinary.uploader.upload(audioFile.path, { resource_type: "video" });
                updatedAudioUrl = audioUpload.secure_url;
            }

            if (req.files.image && req.files.image[0]) {
                const imageFile = req.files.image[0];
                const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" });
                updatedImageUrl = imageUpload.secure_url;
            }
        }

        // Tính lại duration nếu có tệp audio mới
        const duration = req.files?.audio?.[0]
            ? `${Math.floor(audioUpload.duration / 60)}:${Math.floor(audioUpload.duration % 60)}`
            : song.duration;

        // Cập nhật thông tin bài hát
        const updatedSong = await songModel.findByIdAndUpdate(
            id,
            {
                name: name || song.name,
                image: updatedImageUrl,
                file: updatedAudioUrl,
                duration,
                artistId: artistId || song.artistId,
                albumId: albumId || song.albumId,
            },
            { new: true } // Trả về bài hát đã được cập nhật
        );

        // Cập nhật album nếu albumId thay đổi
        if (albumId && albumId !== song.albumId?.toString()) {
            if (!mongoose.Types.ObjectId.isValid(albumId)) {
                return res.status(400).json({ message: "Invalid albumId" });
            }

            await albumModel.findByIdAndUpdate(song.albumId, { $pull: { songs: song._id } });
            await albumModel.findByIdAndUpdate(albumId, { $push: { songs: song._id } });
        }

        // Cập nhật artist nếu artistId thay đổi
        if (artistId && artistId !== song.artistId?.toString()) {
            if (!mongoose.Types.ObjectId.isValid(artistId)) {
                return res.status(400).json({ message: "Invalid artistId" });
            }

            await artistModel.findByIdAndUpdate(song.artistId, { $pull: { songs: song._id } });
            await artistModel.findByIdAndUpdate(artistId, { $push: { songs: song._id } });
        }

        res.status(200).json({ message: "Cập nhật bài hát thành công", song: updatedSong });
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error });
    }
};



export { addSong, listSong, removeSong, updateSong, searchSong }