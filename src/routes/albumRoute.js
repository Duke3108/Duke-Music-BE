import { addAlbum, listAlbum, removeAlbum, updateAlbum } from "../controllers/albumController.js";
import express from 'express'
import upload from "../middleware/multer.js";

const albumRouter = express.Router()

albumRouter.post('/add', upload.single('image'), addAlbum)
albumRouter.get('/list', listAlbum)
albumRouter.post('/remove', removeAlbum)
albumRouter.put('/update/:id', upload.single('image'), updateAlbum)

export default albumRouter
