import express from 'express'
import { updateUserProfile } from '../controllers/updateUserProfile.js';

const router = express.Router();

router.put('/updateProfile', updateUserProfile)

export default router