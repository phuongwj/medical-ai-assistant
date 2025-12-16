import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import bodyParser from 'body-parser';

import router from './routes/messageRoutes.js';

const app = express();
const port = process.env.PORT || 8000;

app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN, 
    credentials: true,
  })
);

/* Parses incoming request bodies with a Content-Type of application/json */
app.use(bodyParser.json());

/**
 * Parses URL-encoded form data (e.g. from an HTML form submission) into a
 * JavaScript object and make it available on req.body
 */
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
)

// API Routes
app.use(router);

app.listen(port, () => {
    console.log(`App running on port ${port}.`)
})