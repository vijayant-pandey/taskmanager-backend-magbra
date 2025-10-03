import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from "./config/db.js";

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';


// CREATE TASK
import taskRoutes from "./routes/taskRoutes.js";

dotenv.config();

// Connect Database
connectDB();


const app = express();

// Middleware
// app.use(cors());

const corsOptions = {
  origin: process.env.FRONTEND_URL || '*',  // default to all if env not set
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

// Serve static files
app.use(express.static("public"));

// mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// CREATE TASKS API
app.use("/api/tasks", taskRoutes);


// serve simple static views to test easily
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/views', express.static(path.join(__dirname, 'views')));


// Routes (we will add later)
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
