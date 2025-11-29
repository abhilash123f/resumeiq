import express from 'express';
import { 
  generateSummary, 
  generateBullets, 
  generateSkills,
  buildFullResume,
  getBuilderResumes,
  saveBuilderResume,
  deleteBuilderResume
} from '../controllers/resumeBuilderController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { aiRateLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// AI generation endpoints (rate limited)
router.post('/generate-summary', aiRateLimiter, generateSummary);
router.post('/generate-bullets', aiRateLimiter, generateBullets);
router.post('/generate-skills', aiRateLimiter, generateSkills);
router.post('/build-full', aiRateLimiter, buildFullResume);

// CRUD operations
router.get('/', getBuilderResumes);
router.post('/save', saveBuilderResume);
router.delete('/:id', deleteBuilderResume);

export default router;
