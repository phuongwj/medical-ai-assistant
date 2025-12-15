import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';

import router from './routes/messageRoutes.js';

const app = express();
const port = 8000;

/* ES modules __dirname */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// Serves frontend as static files from ../frontend
const frontendPath = path.join(__dirname, '..', 'frontend');
app.use(express.static(frontendPath));

// Root route -> message.html
app.get('/', (request, response) => {
  response.sendFile(path.join(frontendPath, 'message.html'));
});

// API Routes
app.use(router);

app.listen(port, () => {
    console.log(`App running on port ${port}.`)
})