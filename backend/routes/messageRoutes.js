import express from "express";
import { sendMessage } from "../controllers/messageController";

const router = express.Router();

/* Using routes to organize API endpoints */
router.post('/api/sendMessage', sendMessage);

export default router;