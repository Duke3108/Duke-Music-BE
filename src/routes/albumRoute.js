import { addAlbum, getAlbumByName, listAlbum, deleteAlbum, updateAlbum } from "../controllers/albumController.js";
import express from 'express'
import upload from "../middleware/multer.js";

const albumRouter = express.Router()

albumRouter.post('/add', upload.single('image'), addAlbum)
albumRouter.get('/list', listAlbum)
albumRouter.put('/remove/:id', deleteAlbum)
albumRouter.put('/update/:id', upload.single('image'), updateAlbum)
albumRouter.get('/:name', getAlbumByName)



export default albumRouter
