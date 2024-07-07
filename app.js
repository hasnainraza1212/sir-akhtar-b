import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import verificationRoutes from "./routes/verificationRoute.js"
import cors from "cors"
import winston from 'winston';
import expressWinston from 'express-winston';
dotenv.config();

connectDB();

const app = express();

const corsOptions = {
  origin: ['http://localhost:5173', 'http://localhost:5500', 'http://127.0.0.1:5500','https://study-space-akhtar-raza.vercel.app'],
    optionsSuccessStatus: 200,
    credentials: true,
    methods: ['GET', 'POST'],
  };
  
app.use(cors(corsOptions));
// for development

app.use(express.json());

  app.use(
    express.json({
      limit: "16kb",
    })
  );

// Set up Winston loggers
// const requestLogger = winston.createLogger({
//   level: 'info',
//   format: winston.format.printf(({ level, message, method, time, timestamp, url, host, origin }) => {
//     return JSON.stringify({
//       host,
//       level,
//       message,
//       method,
//       origin,
//       time,
//       timestamp,
//       url,
//     });
//   }),
//   transports: [
//     new winston.transports.Console(),
//     new winston.transports.File({ filename: 'logs/requests.log', level: 'info' }),
//   ],
// });

// const responseLogger = winston.createLogger({
//   level: 'info',
//   format: winston.format.printf(({ level, message, method, time, timestamp, url, host, origin, response }) => {
//     return JSON.stringify({
//       host,
//       level,
//       message,
//       method,
//       origin,
//       response,
//       time,
//       timestamp,
//       url,
//     });
//   }),
//   transports: [
//     new winston.transports.Console(),
//     new winston.transports.File({ filename: 'logs/responses.log', level: 'info' }),
//   ],
// });

// const errorLogger = winston.createLogger({
//   level: 'error',
//   format: winston.format.printf(({ level, message, method, time, timestamp, url, host, origin, stack }) => {
//     return JSON.stringify({
//       host,
//       level,
//       message,
//       method,
//       origin,
//       time,
//       timestamp,
//       url,
//       stack,
//     });
//   }),
//   transports: [
//     new winston.transports.Console(),
//     new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
//   ],
// });

// Custom middleware to log request details
// app.use((req, res, next) => {
//   requestLogger.info({
//     host: req.headers.host,
//     level: 'info',
//     message: 'HTTP Request',
//     method: req.method,
//     origin: req.headers.origin,
//     time: new Date().toISOString(),
//     timestamp: new Date().toISOString(),
//     url: req.url,
//   });
//   next();
// });

// Middleware for logging responses
// app.use((req, res, next) => {
//   const originalSend = res.send;

//   res.send = function (body) {
//     responseLogger.info({
//       host: req.headers.host,
//       level: 'info',
//       message: 'HTTP Response',
//       method: req.method,
//       origin: req.headers.origin,
//       response: body,
//       time: new Date().toISOString(),
//       timestamp: new Date().toISOString(),
//       url: req.url,
//     });

//     return originalSend.call(this, body);
//   };
//   next();
// });

app.use('/api/auth', authRoutes);
app.use('/api/verification', verificationRoutes);
app.get("/", (req,res)=>{
  return res.send({message:"api working"})
})
app.use('*', (req, res) => {
  res.status(404).send({ success:false , message: "Route not found" , status:404,});
});

  
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
