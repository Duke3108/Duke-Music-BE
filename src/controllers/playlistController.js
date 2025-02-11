import { v2 as cloudinary } from 'cloudinary'
import playlistModel from '../models/playlistModel.js';
import clientModel from '../models/clientModel.js';


export const addPlaylist = async (req, res) => {
    try {

        const { ownerId, songs } = req.body;

        const playlistData = {
            name: "",
            desc: "",
            imageUrl: "",
            songs: songs || [],
            ownerId: ownerId || null
        }

        const newPlaylist = playlistModel(playlistData)
        await newPlaylist.save()

        if (ownerId) {
            await clientModel.findByIdAndUpdate(ownerId, {
                $push: { playlist: newPlaylist._id },
            }, { new: true })
        }

        res.status(201).json({ message: 'Thêm playlist thành công', newPlaylist });
    } catch (err) {
        res.status(500).json({ message: "Error creating playlist", error: err.message });
    }
};

export const addSongToPlaylist = async (req, res) => {
    try {
        const { playlistId, songId } = req.body;

        // Kiểm tra dữ liệu đầu vào
        if (!playlistId || !songId) {
            return res.status(400).json({ message: "playlistId và songId là bắt buộc" });
        }

        // Tìm và cập nhật playlist
        const updatedPlaylist = await playlistModel.findByIdAndUpdate(
            playlistId,
            { $addToSet: { songs: songId } }, // $addToSet đảm bảo không thêm trùng lặp
            { new: true }
        ).populate('songs'); // Populate để trả về chi tiết các bài hát nếu cần

        if (!updatedPlaylist) {
            return res.status(404).json({ message: "Không tìm thấy playlist" });
        }

        res.status(200).json({
            message: 'Thêm bài hát vào playlist thành công',
            updatedPlaylist
        });
    } catch (err) {
        res.status(500).json({ message: "Lỗi khi thêm bài hát vào playlist", error: err.message });
    }
};

export const getPlaylist = async (req, res) => {
    try {
        const { id } = req.params; // Lấy id từ URL nếu có

        if (id) {
            // Lấy thông tin chi tiết một playlist
            const playlist = await playlistModel.findById(id)
                .populate('songs') // Lấy chi tiết các bài hát trong playlist
                .populate('ownerId', 'name email'); // Lấy thông tin chủ sở hữu (tên và email)

            if (!playlist) {
                return res.status(404).json({ message: "Không tìm thấy playlist" });
            }

            return res.status(200).json({ message: "Lấy chi tiết playlist thành công", playlist });
        } else {
            // Lấy danh sách tất cả các playlist
            const playlists = await playlistModel.find()
                .populate('ownerId', 'name email'); // Lấy thông tin chủ sở hữu (nếu cần)

            return res.status(200).json({ message: "Lấy danh sách playlist thành công", playlists });
        }
    } catch (err) {
        res.status(500).json({ message: "Lỗi khi lấy playlist", error: err.message });
    }
};

export const getPlaylistById = async (req, res) => {
    try {
        const { id } = req.params;
        const playlist = await playlistModel.findById(id)
            .populate('songs') // Lấy chi tiết các bài hát trong playlist
            .populate('ownerId', 'name email'); // Lấy thông tin chủ sở hữu (tên và email)

        if (!playlist) {
            return res.status(404).json({ message: "Không tìm thấy playlist" });
        }

        return res.status(200).json({ message: "Lấy chi tiết playlist thành công", playlist });
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi lấy playlist", error: err.message });
    }
}
