import cookieParser from 'cookie-parser';
import cors from 'cors';
import * as dotenv from 'dotenv';
import express from 'express';
import proxy from 'express-http-proxy';
import { ipKeyGenerator, rateLimit } from 'express-rate-limit';
import morgan from 'morgan';
import initializeSiteConfig from './libs/initializeSiteConfig';
dotenv.config();

const app = express();

app.use(
  cors({
    origin: ['http://localhost:3000'],
    allowedHeaders: ['Authorization', 'Content-Type'],
    credentials: true,
  })
);

app.use(morgan('dev'));
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));
app.use(cookieParser());
app.set('trust proxy', 1);

// Apply rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: (req: any) => (req.user ? 1000 : 100),
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: true,
  keyGenerator: (req, res) => ipKeyGenerator(req.ip || 'unknown'),
});
app.use(limiter);

app.get('/gateway-health', (req, res) => {
  res.send({ message: 'Welcome to api-gateway!' });
});

app.use(
  '/products',
  proxy('http://localhost:6002', {
    proxyReqPathResolver: (req) => {
      return req.url;
    },
  })
);
app.use('/', proxy('http://localhost:6001'));

const port = process.env.PORT || 8080;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
  try {
    initializeSiteConfig();
    console.log('Site config initialized successfully.');
  } catch (error) {
    console.log('/n----------------/n');
    console.log(error);
  }
});
server.on('error', console.error);
