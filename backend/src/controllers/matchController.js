import Match from '../models/Match.js';
import Resume from '../models/Resume.js';
import { createEmbeddings } from '../services/embeddingService.js';
import { findSimilarChunks } from '../services/similarityService.js';
import { callLLM } from '../services/llmService.js';
import { chunkText } from '../services/chunkService.js';
import {
  generateCacheKey,
  getCachedMatch,
  setCachedMatch,
  extractResumeSummary,
  extractJdSummary,
  extractCandidateSentences,
  computeKeywordMatch,
  runLocalAtsChecks,
  mergeResults,
} from '../services/fastMatchService.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Fast match handler - single LLM call with compact prompt
 */
async function handleFastMatch(req, res, resume, userId) {
  const { resumeId, jobDescription } = req.body;

  // Check cache first
  const cacheKey = generateCacheKey(resumeId, jobDescription);
  const cachedResult = getCachedMatch(cacheKey);
  
  if (cachedResult) {
    console.log('Returning cached match result');
    return res.status(200).json({
      message: 'Match analysis completed (cached)',
      match: cachedResult,
      cached: true,
    });
  }

  // Extract summaries (not full text)
  const resumeSummary = extractResumeSummary(resume.text);
  const jdSummary = extractJdSummary(jobDescription);
  const candidateSentences = extractCandidateSentences(resume.text);

  // Run local precompute checks
  const keywordMatch = computeKeywordMatch(resume.text, jobDescription);
  const localAts = runLocalAtsChecks(resume.text);

  // Load compact prompt
  const compactPromptPath = path.join(__dirname, '..', 'prompts', 'compact_match_prompt.md');
  let compactPrompt = await fs.readFile(compactPromptPath, 'utf-8');

  // Replace placeholders
  compactPrompt = compactPrompt
    .replace('{{resume_summary}}', resumeSummary)
    .replace('{{jd_summary}}', jdSummary)
    .replace('{{candidate_sentences}}', candidateSentences || 'None provided');

  // Single LLM call
  const llmResult = await callLLM(
    'You are an ATS resume matcher. Return ONLY valid JSON.',
    compactPrompt,
    { responseFormat: 'json' }
  );

  // Parse strict JSON
  let compactAnalysis;
  try {
    compactAnalysis = typeof llmResult === 'string' ? JSON.parse(llmResult) : llmResult;
  } catch (err) {
    console.error('Failed to parse compact LLM response:', llmResult);
    throw new Error('Invalid LLM response format');
  }

  // Merge with local results
  const mergedResults = mergeResults(compactAnalysis, {
    keywordMatch,
    atsScore: localAts.atsScore,
    issues: localAts.issues,
    recommendations: localAts.recommendations,
  });

  // Map compact format to existing Match schema
  const breakdown = {
    skills: Math.min(100, Math.max(0, mergedResults.skills_match || 0)),
    experience: Math.min(100, Math.max(0, mergedResults.experience_match || 0)),
    keywords: Math.min(100, Math.max(0, mergedResults.keyword_match || keywordMatch)),
  };

  // Validate scores - if local keyword match is low, cap overall score
  if (keywordMatch < 30) {
    breakdown.keywords = Math.min(breakdown.keywords, keywordMatch + 10);
  }

  // Calculate final score with validation
  let finalScore = mergedResults.overall_match_score || Math.round(
    (breakdown.skills + breakdown.experience + breakdown.keywords) / 3
  );

  // Sanity check: if keyword match is very low, overall score should be low too
  if (keywordMatch < 20) {
    finalScore = Math.min(finalScore, 35);
  } else if (keywordMatch < 40) {
    finalScore = Math.min(finalScore, 55);
  }

  // Ensure score is within bounds
  finalScore = Math.min(100, Math.max(0, finalScore));

  // Save to database
  const match = await Match.create({
    userId,
    resumeId,
    jobDescription,
    score: finalScore,
    breakdown,
    missingSkills: mergedResults.missing_skills || [],
    strengths: mergedResults.strengths || [],
    weaknesses: mergedResults.areas_for_improvement || [],
    explanation: mergedResults.analysis_summary || 'Fast analysis completed',
    tailoredBullets: mergedResults.improved_resume_bullets || [],
    originalBullets: [],
    atsWarnings: mergedResults.issues || [],
    atsRecommendations: mergedResults.recommendations || [],
    passesATS: (mergedResults.ats_score || 0) >= 70,
    topChunks: [],
  });

  const matchResponse = {
    id: match._id,
    score: match.score,
    breakdown: match.breakdown,
    missingSkills: match.missingSkills,
    strengths: match.strengths,
    weaknesses: match.weaknesses,
    explanation: match.explanation,
    tailoredBullets: match.tailoredBullets,
    originalBullets: match.originalBullets,
    atsWarnings: match.atsWarnings,
    atsRecommendations: match.atsRecommendations,
    passesATS: match.passesATS,
    createdAt: match.createdAt,
  };

  // Cache the result
  setCachedMatch(cacheKey, matchResponse);

  return res.status(201).json({
    message: 'Match analysis completed (fast mode)',
    match: matchResponse,
    fast: true,
  });
}

export const createMatch = async (req, res, next) => {
  try {
    const { resumeId, jobDescription, fast } = req.body;
    const userId = req.user.userId;
    
    if (!resumeId || !jobDescription) {
      return res.status(400).json({ error: 'resumeId and jobDescription required' });
    }
    
    if (jobDescription.trim().length < 50) {
      return res.status(400).json({ error: 'Job description too short' });
    }
    
    // Get resume
    const resume = await Resume.findOne({ _id: resumeId, userId });
    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    // ========== FAST MODE (OPT-IN) ==========
    if (fast === true) {
      return await handleFastMatch(req, res, resume, userId);
    }
    // ========== END FAST MODE ==========
    
    // Create embedding for job description
    const [jdEmbedding] = await createEmbeddings([jobDescription]);
    
    // Find similar chunks from resume
    const similarChunks = findSimilarChunks(
      jdEmbedding,
      resume.chunks,
      10 // top 10 chunks
    );
    
    // Prepare snippets for LLM
    const snippets = similarChunks.map(chunk => ({
      text: chunk.text,
      similarity: chunk.similarity.toFixed(3),
      metadata: chunk.metadata,
    }));
    
    // Load match prompt
    const matchPromptPath = path.join(__dirname, '..', 'prompts', 'match_prompt.md');
    let matchPrompt = await fs.readFile(matchPromptPath, 'utf-8');
    
    // Replace placeholders
    matchPrompt = matchPrompt
      .replace('{{job_description}}', jobDescription)
      .replace('{{snippets}}', JSON.stringify(snippets, null, 2));
    
    // Call LLM for match analysis
    const matchResult = await callLLM(
      'You are a professional recruiter assistant. Produce ONLY valid JSON.',
      matchPrompt,
      { responseFormat: 'json' }
    );
    
    // Parse LLM response
    let analysis;
    try {
      analysis = typeof matchResult === 'string' ? JSON.parse(matchResult) : matchResult;
    } catch (err) {
      console.error('Failed to parse LLM response:', matchResult);
      throw new Error('Invalid LLM response format');
    }
    
    // Calculate aggregate score from breakdown
    const breakdown = analysis.breakdown || { skills: 0, experience: 0, keywords: 0 };
    const aggregateScore = Math.round(
      (breakdown.skills + breakdown.experience + breakdown.keywords) / 3
    );
    
    // Use LLM score if provided, otherwise use aggregate
    const finalScore = analysis.score || aggregateScore;
    
    // Load rewrite prompt for tailored bullets
    const rewritePromptPath = path.join(__dirname, '..', 'prompts', 'rewrite_prompt.md');
    let rewritePrompt = await fs.readFile(rewritePromptPath, 'utf-8');
    
    // Extract bullets from top chunks
    const bullets = similarChunks
      .slice(0, 5)
      .map(c => c.text)
      .filter(t => t.includes('•') || t.match(/^[-*]\s/m));
    
    const keywords = analysis.missingSkills?.slice(0, 5) || [];
    
    rewritePrompt = rewritePrompt
      .replace('{{job_description}}', jobDescription)
      .replace('{{bullets}}', JSON.stringify(bullets))
      .replace('{{keywords}}', JSON.stringify(keywords));
    
    // Call LLM for rewrite suggestions
    const rewriteResult = await callLLM(
      'You are a resume editor that rewrites bullets to be achievement-focused, ATS-friendly, and truthful.',
      rewritePrompt,
      { responseFormat: 'json' }
    );
    
    let rewriteData;
    try {
      rewriteData = typeof rewriteResult === 'string' ? JSON.parse(rewriteResult) : rewriteResult;
    } catch (err) {
      console.error('Failed to parse rewrite response:', rewriteResult);
      rewriteData = { rewrittenBullets: [] };
    }
    
    // Load ATS prompt
    const atsPromptPath = path.join(__dirname, '..', 'prompts', 'ats_prompt.md');
    let atsPrompt = await fs.readFile(atsPromptPath, 'utf-8');
    
    atsPrompt = atsPrompt
      .replace('{{resume_text}}', resume.text.substring(0, 3000))
      .replace('{{job_description}}', jobDescription);
    
    // Call LLM for ATS check
    const atsResult = await callLLM(
      'You simulate an Applicant Tracking System (ATS) scan and return issues/recommendations.',
      atsPrompt,
      { responseFormat: 'json' }
    );
    
    let atsData;
    try {
      atsData = typeof atsResult === 'string' ? JSON.parse(atsResult) : atsResult;
    } catch (err) {
      console.error('Failed to parse ATS response:', atsResult);
      atsData = { passesATS: true, issues: [], recommendations: [] };
    }
    
    // Save match to database
    const match = await Match.create({
      userId,
      resumeId,
      jobDescription,
      score: finalScore,
      breakdown,
      missingSkills: analysis.missingSkills || [],
      strengths: analysis.strengths || [],
      weaknesses: analysis.weaknesses || [],
      explanation: analysis.explanation || '',
      tailoredBullets: rewriteData.rewrittenBullets || [],
      originalBullets: bullets,
      atsWarnings: atsData.issues || [],
      atsRecommendations: atsData.recommendations || [],
      passesATS: atsData.passesATS !== false,
      topChunks: snippets,
    });
    
    res.status(201).json({
      message: 'Match analysis completed',
      match: {
        id: match._id,
        score: match.score,
        breakdown: match.breakdown,
        missingSkills: match.missingSkills,
        strengths: match.strengths,
        weaknesses: match.weaknesses,
        explanation: match.explanation,
        tailoredBullets: match.tailoredBullets,
        originalBullets: match.originalBullets,
        atsWarnings: match.atsWarnings,
        atsRecommendations: match.atsRecommendations,
        passesATS: match.passesATS,
        createdAt: match.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getMatch = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    
    const match = await Match.findOne({ _id: id, userId })
      .populate('resumeId', 'fileName text');
    
    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }
    
    res.json({ match });
  } catch (error) {
    next(error);
  }
};

export const getUserMatches = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const includeDeleted = req.query.includeDeleted === 'true';
    
    const query = { userId };
    if (!includeDeleted) {
      query.isDeleted = false; // Filter out soft-deleted by default
    }
    
    const matches = await Match.find(query)
      .populate('resumeId', 'fileName')
      .select('-topChunks')
      .sort({ createdAt: -1 })
      .limit(50);
    
    res.json({ matches });
  } catch (error) {
    next(error);
  }
};

export const submitFeedback = async (req, res, next) => {
  try {
    const { matchId, rating, comment } = req.body;
    const userId = req.user.userId;
    
    if (!matchId || rating === undefined) {
      return res.status(400).json({ error: 'matchId and rating required' });
    }
    
    const match = await Match.findOne({ _id: matchId, userId });
    
    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }
    
    match.feedback = {
      rating: parseInt(rating, 10),
      comment: comment || '',
      submittedAt: new Date(),
    };
    
    await match.save();
    
    res.json({ message: 'Feedback submitted successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * Soft delete a single match
 */
export const softDeleteMatch = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    
    const match = await Match.findOne({ _id: id, userId, isDeleted: false });
    
    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }
    
    match.isDeleted = true;
    match.deletedAt = new Date();
    match.deletedBy = userId;
    await match.save();
    
    res.json({ message: 'Match deleted successfully', matchId: id });
  } catch (error) {
    next(error);
  }
};

/**
 * Bulk soft delete matches by IDs
 */
export const bulkDeleteMatches = async (req, res, next) => {
  try {
    const { matchIds } = req.body;
    const userId = req.user.userId;
    
    if (!matchIds || !Array.isArray(matchIds) || matchIds.length === 0) {
      return res.status(400).json({ error: 'matchIds array required' });
    }
    
    const result = await Match.updateMany(
      { _id: { $in: matchIds }, userId, isDeleted: false },
      {
        $set: {
          isDeleted: true,
          deletedAt: new Date(),
          deletedBy: userId,
        },
      }
    );
    
    res.json({
      message: 'Matches deleted successfully',
      deletedCount: result.modifiedCount,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Clear all matches for a user (soft delete)
 */
export const clearAllMatches = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    
    const result = await Match.updateMany(
      { userId, isDeleted: false },
      {
        $set: {
          isDeleted: true,
          deletedAt: new Date(),
          deletedBy: userId,
        },
      }
    );
    
    res.json({
      message: 'All matches cleared successfully',
      deletedCount: result.modifiedCount,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Restore a soft-deleted match
 */
export const restoreMatch = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    
    const match = await Match.findOne({ _id: id, userId, isDeleted: true });
    
    if (!match) {
      return res.status(404).json({ error: 'Deleted match not found' });
    }
    
    match.isDeleted = false;
    match.deletedAt = null;
    match.deletedBy = null;
    await match.save();
    
    res.json({ message: 'Match restored successfully', matchId: id });
  } catch (error) {
    next(error);
  }
};

/**
 * Hard delete a match (permanent)
 */
export const hardDeleteMatch = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    
    const match = await Match.findOne({ _id: id, userId });
    
    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }
    
    // Delete the match permanently
    await Match.deleteOne({ _id: id });
    
    res.json({ message: 'Match permanently deleted', matchId: id });
  } catch (error) {
    next(error);
  }
};

/**
 * Cleanup expired soft-deleted matches (TTL)
 * Should be called by a cron job
 */
export const cleanupExpiredMatches = async (req, res, next) => {
  try {
    const ttlDays = parseInt(process.env.MATCH_TTL_DAYS || '30', 10);
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() - ttlDays);
    
    const result = await Match.deleteMany({
      isDeleted: true,
      deletedAt: { $lt: expiryDate },
    });
    
    res.json({
      message: 'Expired matches cleaned up',
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    next(error);
  }
};
