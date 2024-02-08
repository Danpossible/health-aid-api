import express, { Application, NextFunction, Request, Response } from 'express';
import cors from 'cors';
import config from '../../config/default';
import enforce from 'express-sslify';
import router from './router/v1/router.module';
import {
  ErrorHandler,
  ErrorConverter,
} from './middlewares/error_handler.middleware';
import morgan from 'morgan';
import hpp from 'hpp';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import AppException from '../exceptions/AppException';
import { Server } from 'socket.io';
import http from 'http';
import WS, { socketUserMiddleware } from '../utils/ws.config';

function getClientIP(req: Request) {
  const header = req.headers['x-forwarded-for'] as string;
  if (header) {
    const ips = header.split(',');
    return ips[0];
  }
  return req.connection.remoteAddress;
}
const createServer = async () => {
  const app: Application = express();

  if (config.env === 'production' || config.env === 'staging') {
    app.use(enforce.HTTPS({ trustProtoHeader: true }));
  }

  if (config.env === 'development') {
    app.use(morgan('dev'));
  }

  // parse json request body
  app.use(express.json({ limit: '10mb' }));
  // parse urlencoded request body
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(cors());
  app.use(hpp());
  app.use(helmet());
  app.use(mongoSanitize());
  if (config.env === 'production') {
    // app.set('trust proxy', true);
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 20, // limit each IP to 100 requests per windowMs
      skipSuccessfulRequests: true,
      keyGenerator: (req) => getClientIP(req), // Use the custom function to get the IP
      message: 'Too many requests from this IP, please try again in an 15mins!',
    });
    app.use('/api', limiter);
  }
  app.disable('x-powered-by');

  const server = http.createServer(app);
  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
      allowedHeaders: ['Content-Type'],
      credentials: true,
    },
  });
  io.use(socketUserMiddleware);
  new WS(io);

  app.get('/', (_req, res) => {
    res.send('<b>Welcome to your App!</b>');
  });

  app.use('/api/v1', router);

  app.all('*', (req: Request, _res: Response, next: NextFunction) => {
    return next(
      new AppException(`Cant find ${req.originalUrl} on the server.`, 404),
    );
  });

  app.use(ErrorConverter);
  app.use(ErrorHandler);
  return server;
};

export default createServer;
