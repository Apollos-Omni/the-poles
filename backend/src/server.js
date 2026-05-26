import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { createAuthRouter } from './routes/auth.js';
import { createFunctionRouter } from './routes/functions.js';
import { createStore } from './lib/store.js';

const app = express();
const port = Number(process.env.PORT || 8787);
const frontendOrigin = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';
const allowedOrigins = new Set([
  frontendOrigin,
  'https://the-poles.com',
  'https://www.the-poles.com',
].filter(Boolean).map((origin) => origin.replace(/\/$/, '')));

const corsOptions = {
  origin(origin, callback) {
    const normalizedOrigin = origin ? origin.replace(/\/$/, '') : '';
    const isVercelPreview = /^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(normalizedOrigin);
    if (!origin || allowedOrigins.has(normalizedOrigin) || isVercelPreview || process.env.NODE_ENV !== 'production') {
      callback(null, true);
      return;
    }
    callback(new Error(`CORS blocked origin: ${origin}`));
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '2mb' }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

const store = createStore();

app.get('/', (_req, res) => {
  res.json({ status: 'ok', service: 'the-poles-backend' });
});

app.get('/health', async (_req, res) => {
  const storage = store.kind;
  res.json({ status: 'ok', service: 'the-poles-backend', storage, timestamp: new Date().toISOString() });
});

app.get('/api/health', async (_req, res) => {
  const storage = store.kind;
  res.json({ ok: true, app: 'the-poles-backend', storage, timestamp: new Date().toISOString() });
});

const functionRouter = createFunctionRouter({ store });
app.use('/api/auth', createAuthRouter({ store }));
app.use('/api/functions', functionRouter);

// Compatibility for old frontend code and diagnostics that fetch /functions/name directly.
app.use('/functions', functionRouter);

app.use((req, res) => {
  res.status(404).json({ ok: false, error: `Route not found: ${req.method} ${req.originalUrl}` });
});

app.use((err, _req, res, _next) => {
  console.error('[server:error]', err);
  res.status(500).json({ ok: false, error: err.message || 'Internal server error' });
});

app.listen(port, () => {
  console.log(`[the-poles-backend] listening on http://localhost:${port}`);
  console.log(`[the-poles-backend] storage=${store.kind}`);
});
