import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import bodyParser from 'body-parser';
import router from './routes/messageRoutes.js';

const app = express();
const port = 8000;

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

app.use(router);

app.listen(port, () => {
    console.log(`App running on port ${port}.`)
})