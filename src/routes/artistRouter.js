import express from 'express'
import upload from "../middleware/multer.js";
import { addArtist, getArtistByName, listArtist } from '../controllers/artistController.js';

const artistRouter = express.Router()

artistRouter.post('/add', upload.fields([{ name: 'avatar', maxCount: 1 }, { name: 'bg', maxCount: 1 }]), addArtist)

artistRouter.get('/', listArtist)

artistRouter.get('/:name', getArtistByName)

artistRouter.put('update/:id')

artistRouter.delete('delete/:id')

export default artistRouter
