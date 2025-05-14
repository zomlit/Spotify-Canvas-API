import express from 'express';
import axios from 'axios';
import canvasRoutes from './routes/canvasRoutes.js';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();
const app = express();
const PORT = 3000;

const allowedOrigins = ['http://localhost:3000', 'https://crntly.live'];
app.use(cors({
  origin: function(origin, callback) {
    // allow requests with no origin (like mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

app.use('/api/canvas', canvasRoutes);

app.get('/', (req, res) => {
  res.send('Spotify Canvas API is running!');
});

app.listen(PORT, function () {
    console.log("Listening on PORT: ", PORT);
    if (PORT == 3001) { 
      console.log('Running on local: http://localhost:3001');
    }
});
