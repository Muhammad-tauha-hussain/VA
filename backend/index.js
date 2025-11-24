import express from 'express';
import dotenv from 'dotenv';
import { connectToDB } from './config/MongoDBConnection.js';
import authRouter from './routes/authRoute.js';
import cookieParser from 'cookie-parser';
import cors from 'cors'
import userRouter from './routes/userRoute.js';
import geminiResponse from './gemini.js';
dotenv.config();
const app = express();
app.use(cors(
  {
    origin: 'http://localhost:5173',
    credentials: true
  }
))
app.use(express.json());
app.use(cookieParser())
const PORT = process.env.PORT || 3333;

// Connect to MongoDB ONCE
connectToDB();
app.use("/api/auth", authRouter)
app.use("/api/user", userRouter)

app.get('/', (req, res) => {
  res.send('Hello from Backend');
});
app.get('/gemini', async (req, res) => {
  try {
    const userPrompt = req.query.userPrompt || "Hello";

    const data = await geminiResponse({
      userPrompt,
      assistantName: "Nova",
      userName: "Khizar",
      personalityType: "funny"
    });

    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
});


app.listen(PORT, () => {
  console.log(`Virtual Assistant backend is running on port ${PORT}`);
});
