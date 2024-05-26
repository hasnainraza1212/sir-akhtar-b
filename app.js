import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';

import cors from "cors"
import winston from 'winston';
import expressWinston from 'express-winston';
dotenv.config();

connectDB();

const app = express();
app.use(express.json());

const corsOptions = {
    origin: '*',
    optionsSuccessStatus: 200
  };
  
  app.use(cors(corsOptions));



// Set up Winston loggers
const requestLogger = winston.createLogger({
  level: 'info',
  format: winston.format.printf(({ level, message, method, time, timestamp, url, host, origin }) => {
    return JSON.stringify({
      host,
      level,
      message,
      method,
      origin,
      time,
      timestamp,
      url,
    });
  }),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/requests.log', level: 'info' }),
  ],
});

const responseLogger = winston.createLogger({
  level: 'info',
  format: winston.format.printf(({ level, message, method, time, timestamp, url, host, origin, response }) => {
    return JSON.stringify({
      host,
      level,
      message,
      method,
      origin,
      response,
      time,
      timestamp,
      url,
    });
  }),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/responses.log', level: 'info' }),
  ],
});

const errorLogger = winston.createLogger({
  level: 'error',
  format: winston.format.printf(({ level, message, method, time, timestamp, url, host, origin, stack }) => {
    return JSON.stringify({
      host,
      level,
      message,
      method,
      origin,
      time,
      timestamp,
      url,
      stack,
    });
  }),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
  ],
});

// Custom middleware to log request details
app.use((req, res, next) => {
  requestLogger.info({
    host: req.headers.host,
    level: 'info',
    message: 'HTTP Request',
    method: req.method,
    origin: req.headers.origin,
    time: new Date().toISOString(),
    timestamp: new Date().toISOString(),
    url: req.url,
  });
  next();
});

// Middleware for logging responses
app.use((req, res, next) => {
  const originalSend = res.send;

  res.send = function (body) {
    responseLogger.info({
      host: req.headers.host,
      level: 'info',
      message: 'HTTP Response',
      method: req.method,
      origin: req.headers.origin,
      response: body,
      time: new Date().toISOString(),
      timestamp: new Date().toISOString(),
      url: req.url,
    });

    return originalSend.call(this, body);
  };
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/content', categoryRoutes);


  
app.use((req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
});

// Middleware for logging errors
app.use((err, req, res, next) => {
  errorLogger.error({
    host: req.headers.host,
    level: 'error',
    message: err.message,
    method: req.method,
    origin: req.headers.origin,
    time: new Date().toISOString(),
    timestamp: new Date().toISOString(),
    url: req.url,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });

  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

export default app;
