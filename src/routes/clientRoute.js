import express from 'express'
import clientController from '../controllers/clientController.js'

const clientRoute = express.Router()

//REGISTER
clientRoute.post("/register", clientController.registerClient);

//REFRESH TOKEN
clientRoute.post("/refresh");
//LOG IN
clientRoute.post("/login", clientController.loginClient);
//LOG OUT
clientRoute.post("/logout");


export default clientRoute