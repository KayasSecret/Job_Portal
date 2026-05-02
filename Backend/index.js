import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from './utils/db.js';
import userRoute from './routes/user.route.js';

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const corsOptions = {
    origin: 'http://localhost:5173',
    credentials: true
};
app.use(cors(corsOptions));

const PORT = process.env.PORT || 8080;

// API Routes
app.use("/api/v1/user", userRoute);

const startServer = async () => {
    try {
        await connectDB(); // DB connect first

        app.listen(PORT, () => {
            console.log(`Server running at port ${PORT}`);
        });
    } catch (error) {
        console.log("Database connection failed ❌", error);
        process.exit(1);
    }
};
    
startServer();