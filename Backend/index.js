import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());
const corsOptions = {
    origin: 'https//localhost:5173',
    Credentials: true
}
app.use(cors(corsOptions)); 

const PORT = 8080;
app.listen(PORT, ()=> {
    console.log(`Server running at port ${PORT}`);
})