import express from 'express';
import authRoute from './routes/auth';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import subRoute from './routes/sub'

dotenv.config();

mongoose.connect(
  process.env.MONGO_URI as string
)
.then(() => {
  const app = express();

  app.use(cors());
  app.use(express.json());
  
  app.use('/auth', authRoute)
  app.use('/sub', subRoute)

  const PORT = process.env.PORT || 4000;

  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  })

  console.log('Connected to MongoDB');  
})
.catch((e) => console.log(e))