import express from 'express'
import dotenv from 'dotenv'
import db from './config/db.js';
import authRoutes from './routes/web.js'
import cors from 'cors';
import cookieParser from 'cookie-parser';
dotenv.config({ path: '.env' });



const app = express()
app.use(cookieParser()); 

const FRONTEND_URL = process.env.FRONTEND_URL


app.use(cors({
  origin:[
    FRONTEND_URL,
],
credentials: true,
}));

db();

app.use(express.json({ limit: '50kb' }));

app.use('/api/v1', authRoutes);

const PORT = process.env.PORT 


app.listen(PORT, () => {
    console.log(`${`Server started: http://localhost:`}${PORT}/api/v1`)
})