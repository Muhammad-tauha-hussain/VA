import jwt from "jsonwebtoken";

const isAuth = async (req, res, next) => {
  try {
    let token = req.cookies.token; // 1) Try cookie first

    // 2) If no cookie, try Authorization header
    if (!token) {
      const authHeader = req.headers.authorization;

      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
      }
    }

    // 3) If still no token → unauthorized
    if (!token) {
      return res.status(401).json({ message: "token not found" });
    }

    // 4) Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.userId = decoded.userId;

    next();
  } catch (error) {
    return res.status(401).json({
      message: `isAuth Error: ${error.message}`,
    });
  }
};

export default isAuth;
