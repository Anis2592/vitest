import express from 'express';
import { connectDB } from './config/db.js';
import userRoutes from './routes/userRoutes.js';
import auth from './routes/auth.js';
import dotenv from 'dotenv';

// Load environment variables based on NODE_ENV
if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: '.env.test' });
}

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectDB();

app.use('/api', userRoutes);
app.use('/api/auth', auth);

// Only start server if not in test environment
let server;
if (process.env.NODE_ENV !== 'test') {
  server = app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

export { app, server };