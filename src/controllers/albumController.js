import { v2 as cloudinary } from 'cloudinary'
import albumModel from '../models/albumModel.js'
import artistModel from '../models/artistModel.js'
import mongoose from "mongoose";
import songModel from "../models/songModel.js";

const addAlbum = async (req, res) => {
    try {

        if (!req.file) {
            return res.status(400).json({
                message: "File hình chưa được upload"
            })
        }

        const { name, artistId, bgColour, releaseYear, songs } = req.body
        const imageFile = req.file
        const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" })

        const albumData = {
            name,
            artistId: artistId || null,
            bgColour,
            releaseYear,
            image: imageUpload.secure_url,
            songs: songs || []
        }

        const album = albumModel(albumData)
        await album.save()

        if (artistId) {
            await artistModel.findByIdAndUpdate(artistId, {
                $push: { albums: album._id },
            }, { new: true })
        }

        res.status(201).json({ message: 'Thêm nghệ sĩ thành công', album });

    } catch (error) {
        return res.status(500).json({ message: "Error creating album", error: err.message });
    }
}

const listAlbum = async (req, res) => {
    try {
        const allAlbums = await albumModel.find()
        res.json({ success: true, albums: allAlbums })
    } catch (error) {
        res.json({ success: false })
    }
}

const deleteAlbum = async (req, res) => {
    try {
        const { id } = req.params;

        // Tìm album cần xóa
        const album = await albumModel.findById(id);
        if (!album) {
            return res.status(404).json({ message: "Album không tồn tại" });
        }

        // Xóa album khỏi danh sách albums của nghệ sĩ (nếu có liên kết)
        if (album.artistId) {
            await artistModel.findByIdAndUpdate(album.artistId, {
                $pull: { albums: album._id },
            });
        }

        // Xóa album và cập nhật thông tin các bài hát liên quan
        if (album.songs && album.songs.length > 0) {
            await songModel.updateMany(
                { _id: { $in: album.songs } },
                { $unset: { albumId: "" } } // Xóa liên kết albumId khỏi bài hát
            );
        }

        // Xóa album khỏi cơ sở dữ liệu
        await albumModel.findByIdAndDelete(id);

        res.status(200).json({ message: "Xóa album thành công" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting album", error: error.message });
    }
};


const updateAlbum = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, artistId, bgColour, releaseYear, songs } = req.body;

        // Tìm album cần cập nhật
        const album = await albumModel.findById(id);
        if (!album) {
            return res.status(404).json({ message: "Album không tồn tại" });
        }

        // Xử lý file upload nếu có
        let updatedImageUrl = album.image;
        if (req.file) {
            const imageFile = req.file;
            const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" });
            updatedImageUrl = imageUpload.secure_url;
        }

        // Cập nhật nghệ sĩ liên kết nếu thay đổi
        if (artistId && artistId !== album.artistId?.toString()) {
            if (!mongoose.Types.ObjectId.isValid(artistId)) {
                return res.status(400).json({ message: "Invalid artistId" });
            }

            // Xóa album khỏi nghệ sĩ cũ
            if (album.artistId) {
                await artistModel.findByIdAndUpdate(album.artistId, {
                    $pull: { albums: album._id },
                });
            }

            // Thêm album vào nghệ sĩ mới
            await artistModel.findByIdAndUpdate(artistId, {
                $push: { albums: album._id },
            });
        }

        // Cập nhật bài hát liên kết nếu thay đổi
        if (songs && Array.isArray(songs)) {
            // Xóa liên kết albumId từ các bài hát cũ
            await songModel.updateMany(
                { _id: { $in: album.songs } },
                { $unset: { albumId: "" } }
            );

            // Thêm liên kết albumId vào các bài hát mới
            await songModel.updateMany(
                { _id: { $in: songs } },
                { $set: { albumId: album._id } }
            );
        }

        // Cập nhật thông tin album
        const updatedAlbum = await albumModel.findByIdAndUpdate(
            id,
            {
                name: name || album.name,
                artistId: artistId || album.artistId,
                bgColour: bgColour || album.bgColour,
                releaseYear: releaseYear || album.releaseYear,
                songs: songs || album.songs,
                image: updatedImageUrl,
            },
            { new: true } // Trả về album sau khi cập nhật
        );

        res.status(200).json({ message: "Cập nhật album thành công", album: updatedAlbum });
    } catch (error) {
        res.status(500).json({ message: "Error updating album", error: error.message });
    }
};


/*const getAlbumById = async (req, res) => {
    try {
        const { id } = req.params

        const album = await albumModel.findById(id).populate("songs")

        if (!album) {
            return res.status(404).json({ message: 'không tìm thấy album' })
        }

        res.status(200).json(album)
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error })
    }
}*/

const getAlbumByName = async (req, res) => {
    try {
        const { name } = req.params

        const album = await albumModel.findOne({ name: name }).populate("artistId").populate("songs")

        if (!album) {
            return res.status(404).json({ message: 'không tìm thấy album' })
        }

        res.status(200).json(album)
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error })
    }
}


export { addAlbum, listAlbum, deleteAlbum, updateAlbum, getAlbumByName }