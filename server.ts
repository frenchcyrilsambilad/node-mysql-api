import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import errorHandler from './_middleware/error-handler';
import db from './_helpers/db';
import accountsController from './accounts/accounts.controller';
import swaggerDocs from './_helpers/swagger';

const app = express();

// Middleware to parse request bodies
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Middleware to parse cookies
app.use(cookieParser());

// Allow CORS requests from any origin and with credentials
app.use(cors({ origin: (origin, callback) => callback(null, true), credentials: true }));

// Redirect the homepage to the API docs.
app.get('/', (req, res) => {
    res.redirect('/api-docs');
});

// Swagger documentation route
app.use('/api-docs', swaggerDocs);

app.use(async (_req, res, next) => {
    try {
        if (db.ready) await db.ready;
        next();
    } catch (err) {
        console.error('DB not ready:', err);
        res.status(500).json({ message: 'Database not ready' });
    }
});

// API routes
app.use('/accounts', accountsController);

// Global error handler (must be defined after all routes)
app.use(errorHandler);

// Start server
const port = process.env.NODE_ENV === 'production' ? (process.env.PORT || 80) : 4000;
if (!process.env.VERCEL) {
    app.listen(port, () => console.log('Server listening on port ' + port));
}

export default app;
