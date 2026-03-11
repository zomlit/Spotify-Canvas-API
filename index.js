import express from 'express';
import axios from 'axios';
import canvasRoutes from './routes/canvasRoutes.js';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();
const app = express();
const PORT = 3000;

const allowedOrigins = [
  'https://crntly.live',
  'https://www.crntly.live',
  'https://zomlit.com',
  'https://www.zomlit.com',
  'https://canvas.livestreaming.tools/',
  'https://livestreaming.tools/',
  'http://tauri.localhost',
  'https://tauri.localhost',
  'tauri://localhost',
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, curl, etc.)
      if (!origin) return callback(null, true);
      // Allow any localhost port (Tauri dev uses random ports)
      if (/^https?:\/\/localhost(:\d+)?$/.test(origin)) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    },
    credentials: true,
  })
);

app.use('/api/canvas', canvasRoutes);

app.get('/', (req, res) => {
  res.send('Spotify Canvas API is running!');
});

app.listen(PORT, function () {
  console.log('Listening on PORT: ', PORT);
  if (PORT === 3001) {
    console.log('Running on local: http://localhost:3001');
  }
});
