import express from 'express'
import userController from '../controllers/userController.js'
import {
    verifyToken,
    verifyTokenAdmin
} from '../middleware/verifyToken.js'

const userRouter = express.Router();
//GET ALL USERS
userRouter.get("/", verifyToken, userController.getAllUsers);

//DELETE USER
userRouter.delete("delete/:id", verifyTokenAdmin, userController.deleteUser);

//UPDATE USER
userRouter.put('/update/:id', verifyToken, userController.updateUser)

export default userRouter