import jwt from "jsonwebtoken"
const isAuth = async (req , res , next) => {
    try {
        const token = req.cookies.token
        if(!token) {
            return res.status(401).json({ message: "token not found" })
        }
        console.log(req.cookies)
        const verifyToken = await jwt.verify(token , process.env.JWT_SECRET)
        req.userId = verifyToken.userId
        next()
    } catch (error) {
        res.status(401).json({ message: `isAuth Error ${error.message}` })        
    }
}

export default isAuth