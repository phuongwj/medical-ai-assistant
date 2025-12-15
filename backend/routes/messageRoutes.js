import express from 'express';
import { sendMessage, ingestDocuments } from '../controllers/messageController.js';

const router = express.Router();

/* Using routes to organize API endpoints */
router.post('/api/sendMessage', sendMessage);
router.post('/api/ingestDocuments', ingestDocuments);

export default router;