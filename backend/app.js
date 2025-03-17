import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv"; // Load environment variables
import { connectDB } from "./DB/Database.js";
import transactionRoutes from "./Routers/Transactions.js";
import userRoutes from "./Routers/userRouter.js";

dotenv.config(); // Load .env file

const app = express();
const port = process.env.PORT || 4000; // Use port from .env or default to 4000

// Connect to MongoDB
connectDB();

// Enable CORS for frontend requests
app.use(cors());

// Middleware - Parse JSON and URL-encoded data
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));

// API Routes
app.use("/api/v1", transactionRoutes);
app.use("/api/auth", userRoutes);

app.get("/", (req, res) => {
  res.send("FinManager Server is working");
});

// Start the server
app.listen(port, () => {
  console.log(`🚀 Server is running on http://localhost:${port}`);
});
