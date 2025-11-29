import express from 'express';
import { uploadResume, getResume, deleteResume, listResumes } from '../controllers/resumeController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/multerUpload.js';

const router = express.Router();

// All resume routes require authentication
router.use(authenticate);

// Upload resume file
router.post('/upload', upload.single('resume'), uploadResume);

// Get resume details
router.get('/:id', getResume);

// List user's resumes
router.get('/user/:userId', listResumes);

// Delete resume
router.delete('/:id', deleteResume);

export default router;
