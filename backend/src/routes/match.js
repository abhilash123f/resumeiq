import express from 'express';
import {
  createMatch,
  getMatch,
  getUserMatches,
  submitFeedback,
  softDeleteMatch,
  bulkDeleteMatches,
  clearAllMatches,
  restoreMatch,
  hardDeleteMatch,
  cleanupExpiredMatches,
} from '../controllers/matchController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { aiRateLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// All match routes require authentication
router.use(authenticate);

// Create new match analysis (rate limited)
router.post('/', aiRateLimiter, createMatch);

// Get specific match
router.get('/:id', getMatch);

// Get all matches for current user
router.get('/user/:userId', getUserMatches);

// Submit feedback on match
router.post('/feedback', submitFeedback);

// Delete operations
router.delete('/:id/soft', softDeleteMatch); // Soft delete single match
router.delete('/:id/hard', hardDeleteMatch); // Hard delete single match (permanent)
router.post('/bulk-delete', bulkDeleteMatches); // Bulk soft delete
router.delete('/clear-all', clearAllMatches); // Clear all user matches
router.post('/:id/restore', restoreMatch); // Restore soft-deleted match

// Cleanup (should be called by cron job or admin)
router.post('/cleanup/expired', cleanupExpiredMatches);

export default router;
