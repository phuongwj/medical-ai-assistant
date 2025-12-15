import express from 'express';
import { sendMessage } from '../controllers/messageController';
import { ingestDocuments } from '../controllers/messageController';

const router = express.Router();

/* Using routes to organize API endpoints */
router.post('/api/sendMessage', sendMessage);
router.post('/api/ingestDocuments', ingestDocuments);

export default router;