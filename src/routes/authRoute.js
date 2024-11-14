import express from 'express'
import authController from '../controllers/authController.js'
import { verifyToken } from '../middleware/verifyToken.js'

const authRoute = express.Router()

//REGISTER
authRoute.post("/register", authController.registerUser);

//REFRESH TOKEN
authRoute.post("/refresh", authController.requestRefreshToken);
//LOG IN
authRoute.post("/login", authController.loginUser);
//LOG OUT
authRoute.post("/logout", verifyToken, authController.logOut);


export default authRoute