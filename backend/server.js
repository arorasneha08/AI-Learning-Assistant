import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import errorHandler from './middleware/errorHandler.js';
import authRoutes from './routes/authRoutes.js';
import documentRoutes from './routes/documentRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
connectDB() ;

app.use(cors({
    origin : "*" , 
    methods : ["GET" , "POST" , "PUT" , "DELETE"] ,
    allowedHeaders : ["Content-Type" , "Authorization"],
    credentials : true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/uploads" , express.static(path.join(__dirname , "uploads"))) ;

// Routes 
app.use("/api/auth" , authRoutes);
app.use("/api/documents" , documentRoutes);

app.use(errorHandler);


app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found",
        statusCode : 404
    })
})

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

process.on("unhandledRejection" , (err) => {
    console.error(`Unhandled Rejection: ${err.message}`);
    process.exit(1);
})