import express from 'express'
import clientController from '../controllers/clientController.js'
import { verifyToken } from '../middleware/verifyToken.js'

const clientRoute = express.Router()

//REGISTER
clientRoute.post("/register", clientController.registerClient);

//REFRESH TOKEN
clientRoute.post("/refresh", clientController.requestRefreshToken);
//LOG IN
clientRoute.post("/login", clientController.loginClient);
//LOG OUT
clientRoute.post("/logout", verifyToken, clientController.logOut);


export default clientRoute