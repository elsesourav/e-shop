import { errorMiddleware } from '@/packages/error-handler/error-middleware';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import { createOrder } from './controllers/order.controller';
import router from './routes/order.route';

const app = express();

// Stripe webhook endpoint - must be before express.json() and with raw body parser
app.post(
  '/api/create-order',
  bodyParser.raw({ type: 'application/json' }),
  (req, _, next) => {
    (req as any).rawBody = req.body;
    next();
  },
  createOrder
);

// CORS configuration for regular API endpoints (not webhook)
app.use(
  cors({
    origin: ['http://localhost:3000'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
// app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send({ message: 'Welcome to order-service!' });
});

app.use('/api', router);

app.use(errorMiddleware);

const port = process.env.PORT || 6004;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});
server.on('error', console.error);
