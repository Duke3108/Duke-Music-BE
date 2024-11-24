import { addAlbum, getAlbumById, getAlbumByName, listAlbum, deleteAlbum, updateAlbum } from "../controllers/albumController.js";
import express from 'express'
import upload from "../middleware/multer.js";

const albumRouter = express.Router()

albumRouter.post('/add', upload.single('image'), addAlbum)
albumRouter.get('/list', listAlbum)
albumRouter.post('/remove', deleteAlbum)
albumRouter.put('/update/:id', upload.single('image'), updateAlbum)
albumRouter.get('/:name', getAlbumByName)
albumRouter.get('/:id', getAlbumById)


export default albumRouter
