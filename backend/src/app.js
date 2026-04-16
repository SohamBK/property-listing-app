import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import path from 'path';
import routes from './routes/index.js';
import errorMiddleware from './middleware/error.middleware.js';
import loggerMiddleware from './middleware/logger.middleware.js';

const app = express();

// Core Middleware
app.use(
    cors({
        origin: 'http://localhost:5173',
        credentials: true,
    })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Static File
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Logging
app.use(loggerMiddleware);

// for testing
app.get('/', (req, res) => {
    res.send('API is running...');
});

// Routes
app.use('/api/v1', routes);

// Error Handler
app.use(errorMiddleware);

export default app;
