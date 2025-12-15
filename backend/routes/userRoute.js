import express from 'express'
import getCurrentUser, { askToAssistant, updateAssistant } from '../controllers/userController.js'
import isAuth from '../middleware/isAuth.js'
import upload from '../middleware/multer.js'

const userRouter = express.Router()
userRouter.get("/current", isAuth ,getCurrentUser)
userRouter.post("/update", isAuth,upload.single("assistantImage") ,updateAssistant)
userRouter.post("/ask", isAuth, askToAssistant)
export default userRouter