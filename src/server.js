import express from 'express'
import dotenv from 'dotenv'
import db from './config/db.js';
import authRoutes from './routes/web.js'


dotenv.config({ path: '.env' });

const app = express()

db();

app.use(express.json())


app.use('/api/v1', authRoutes);


const PORT = process.env.PORT 

app.listen(PORT, () => {
    console.log('Server is running on port ' + PORT)
})