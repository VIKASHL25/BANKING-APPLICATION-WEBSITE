import express from 'express';
import { login as staffLogin } from '../controllers/staffController.js';

const router = express.Router();

router.post('/login', staffLogin);

export default router;