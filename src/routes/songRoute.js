import { addSong, listSong, removeSong, searchSong, updateSong } from "../controllers/songController.js";
import express from 'express'
import upload from "../middleware/multer.js";

const songRouter = express.Router()

songRouter.post('/add', upload.fields([{ name: 'image', maxCount: 1 }, { name: 'audio', maxCount: 1 }]), addSong)
songRouter.get('/list', listSong)
songRouter.post('/remove', removeSong)
songRouter.put('/update/:id', upload.fields([{ name: 'audio', maxCount: 1 }, { name: 'image', maxCount: 1 }]), updateSong)
songRouter.get('/:keyword', searchSong)

export default songRouter
