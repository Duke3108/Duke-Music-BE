import artistModel from "../models/artistModel.js";
import { v2 as cloudinary } from 'cloudinary'

export const addArtist = async (req, res) => {
    try {
        if (!req.files || !req.files.avatar[0] || !req.files.bg[0]) {
            return res.status(400).json({
                message: "File hình chưa được upload"
            })
        }

        const { name, songs, albums } = req.body;
        const avatarFile = req.files.avatar[0]
        const bgFile = req.files.bg[0]
        const avatarUpload = await cloudinary.uploader.upload(avatarFile.path, { resource_type: "image" })
        const bgUpload = await cloudinary.uploader.upload(bgFile.path, { resource_type: "image" })

        const artistData = {
            name,
            avatar: avatarUpload.secure_url,
            bg: bgUpload.secure_url,
            songs: songs || [],
            albums: albums || []
        }

        const newArtist = artistModel(artistData)
        await newArtist.save()

        res.status(201).json({ message: 'Thêm nghệ sĩ thành công', newArtist });
    } catch (err) {
        res.status(500).json({ message: "Error creating artist", error: err.message });
    }
};

export const listArtist = async (req, res) => {
    try {
        const allArtist = await artistModel.find().sort({ createdAt: -1 })
        res.json({ success: true, artists: allArtist })
    } catch (error) {
        res.json({ success: false })
    }
}

/*export const getArtistByIdOrName = async (req, res) => {
    try {
        const { params } = req.params

        const artistById = await artistModel.findById(params)

        if (!artistById) {
            
            if (!artistByName) {
                return res.status(404).json({ message: 'không tìm thấy Nghệ sĩ' })
            }
            res.json({ success: true, artists: artistByName })
        }

        res.json({ success: true, artists: artistById })
    } catch (error) {
        res.json({ success: false })
    }
}*/

export const getArtistByName = async (req, res) => {
    try {
        const { name } = req.params

        const artist = await artistModel.findOne({ name: name })

        if (!artist) {
            return res.status(404).json({ message: 'không tìm thấy Nghệ sĩ' })
        }
        res.json({ success: true, artists: artist })
    } catch (error) {
        res.json({ success: false })
    }
}

export const updateArtist = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, albums, songs } = req.body;

        // Kiểm tra id của nghệ sĩ
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid artist id" });
        }

        // Tìm nghệ sĩ
        const artist = await artistModel.findById(id);
        if (!artist) {
            return res.status(404).json({ message: "Nghệ sĩ không tồn tại" });
        }

        // Xử lý file upload nếu có
        let updatedImageUrl = artist.image;
        if (req.file) {
            const imageFile = req.file;
            const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" });
            updatedImageUrl = imageUpload.secure_url;
        }

        // Cập nhật album nếu thay đổi
        if (albums && Array.isArray(albums)) {
            const newAlbums = albums.map(albumId => mongoose.Types.ObjectId(albumId));

            // Loại bỏ nghệ sĩ khỏi album cũ
            await albumModel.updateMany(
                { _id: { $in: artist.albums } },
                { $unset: { artistId: "" } }
            );

            // Thêm nghệ sĩ vào album mới
            await albumModel.updateMany(
                { _id: { $in: newAlbums } },
                { $set: { artistId: artist._id } }
            );
        }

        // Cập nhật bài hát nếu thay đổi
        if (songs && Array.isArray(songs)) {
            const newSongs = songs.map(songId => mongoose.Types.ObjectId(songId));

            // Loại bỏ nghệ sĩ khỏi bài hát cũ
            await songModel.updateMany(
                { _id: { $in: artist.songs } },
                { $unset: { artistId: "" } }
            );

            // Thêm nghệ sĩ vào bài hát mới
            await songModel.updateMany(
                { _id: { $in: newSongs } },
                { $set: { artistId: artist._id } }
            );
        }

        // Cập nhật thông tin nghệ sĩ
        const updatedArtist = await artistModel.findByIdAndUpdate(
            id,
            {
                name: name || artist.name,
                image: updatedImageUrl,
                albums: albums || artist.albums,
                songs: songs || artist.songs,
            },
            { new: true } // Trả về bản ghi đã cập nhật
        );

        res.status(200).json({ message: "Cập nhật nghệ sĩ thành công", artist: updatedArtist });
    } catch (error) {
        res.status(500).json({ message: "Error updating artist", error: error.message });
    }
};


export const deleteArtist = async (req, res) => {
    try {
        const { id } = req.params;

        // Kiểm tra id của nghệ sĩ
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid artist id" });
        }

        // Tìm nghệ sĩ
        const artist = await artistModel.findById(id);
        if (!artist) {
            return res.status(404).json({ message: "Nghệ sĩ không tồn tại" });
        }

        // Xóa tất cả album của nghệ sĩ
        if (artist.albums && artist.albums.length > 0) {
            await albumModel.deleteMany({ _id: { $in: artist.albums } });

            // Cập nhật các bài hát liên quan (xóa albumId)
            await songModel.updateMany(
                { albumId: { $in: artist.albums } },
                { $unset: { albumId: "" } }
            );
        }

        // Xóa liên kết bài hát của nghệ sĩ
        if (artist.songs && artist.songs.length > 0) {
            await songModel.updateMany(
                { _id: { $in: artist.songs } },
                { $unset: { artistId: "" } }
            );
        }

        // Xóa nghệ sĩ
        await artistModel.findByIdAndDelete(id);

        res.status(200).json({ message: "Xóa nghệ sĩ thành công" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting artist", error: error.message });
    }
};

