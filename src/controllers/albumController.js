import { v2 as cloudinary } from 'cloudinary'
import albumModel from '../models/albumModel.js'

const addAlbum = async (req, res) => {
    try {
        const name = req.body.name
        const desc = req.body.desc
        const bgColour = req.body.bgColour
        const imageFile = req.file
        const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" })

        const albumData = {
            name,
            desc,
            bgColour,
            image: imageUpload.secure_url,
        }

        const album = albumModel(albumData)
        await album.save()

        res.json({ success: true, message: "Album added" })

    } catch (error) {
        res.json({ success: false })
    }
}

const listAlbum = async (req, res) => {
    try {
        const allAlbums = await albumModel.find({})
        res.json({ success: true, albums: allAlbums })
    } catch (error) {
        res.json({ success: false })
    }
}

const removeAlbum = async (req, res) => {
    try {
        await albumModel.findByIdAndDelete(req.body.id)
        res.json({ success: true, message: "album removed" })
    } catch (error) {
        res.json({ success: false })
    }
}

const updateAlbum = async (req, res) => {
    try {
        const albumId = req.params.id;
        const { name, desc, bgColour } = req.body;
        const album = await albumModel.findById(albumId);

        if (!album) {
            return res.status(404).json({ success: false, message: "Album not found" });
        }

        // Update text fields
        if (name) album.name = name;
        if (desc) album.desc = desc;
        if (bgColour) album.bgColour = bgColour;

        // Update image if a new file is provided
        if (req.file) {
            const imageFile = req.file;
            const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" });
            album.image = imageUpload.secure_url;
        }

        await album.save();

        res.json({ success: true, message: "Album updated", album });

    } catch (error) {
        res.status(500).json({ success: false, message: "An error occurred", error: error.message });
    }
};


export { addAlbum, listAlbum, removeAlbum, updateAlbum }