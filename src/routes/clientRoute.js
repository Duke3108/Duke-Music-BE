import express from 'express'

const clientRoute = express.Router()

//REGISTER
clientRoute.post("/register");

//REFRESH TOKEN
clientRoute.post("/refresh");
//LOG IN
clientRoute.post("/login");
//LOG OUT
clientRoute.post("/logout");


export default clientRoute