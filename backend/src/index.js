import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import authRouter from './routes/auth.js';
import leadsRouter from './routes/leads.js';

const app = express();

// CORS
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';
const allowed = new Set([
  FRONTEND_ORIGIN,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
]);

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);           
      return cb(null, allowed.has(origin));         
    },
    credentials: true,
  })
);

app.use((req, _res, next) => { console.log(req.method, req.path); next(); });


// Parsers
app.use(express.json());
app.use(cookieParser());

// Health
app.get('/', (_req, res) => {
  res.json({ ok: true, service: 'Leads API (Mongo)' });
});

// Routes
app.use('/auth', authRouter);
app.use('/leads', leadsRouter);

// 404
app.use((_req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// Error handler
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Server error' });
});

// Start after Mongo connects
const PORT = process.env.PORT || 8080;
const MONGO_URI = process.env.MONGO_URI;

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('Mongo connected (app)');
    app.listen(PORT, () => console.log(`API listening on :${PORT}`));
  })
  .catch((err) => {
    console.error('Mongo connection error', err);
    process.exit(1);
  });

console.log('Mongo connected (app) db =', mongoose.connection.name);
