import express from 'express'
import { addPlaylist, addSongToPlaylist, getPlaylist } from '../controllers/playlistController.js'

const playlistRouter = express.Router()

playlistRouter.post('/add', addPlaylist)

playlistRouter.post('/addSong', addSongToPlaylist)

playlistRouter.get('/', getPlaylist)

playlistRouter.get('/:id')

playlistRouter.put('update/:id')

playlistRouter.delete('delete/:id')

export default playlistRouter