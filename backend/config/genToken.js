import jwt from "jsonwebtoken";

const genToken =async (userId) => {
  try {
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "15d" });
  } catch (error) {
    throw new Error("Error generating token: " + error.message);
  }
};

export default genToken;
