import crypto from 'crypto';

/**
 * Fast match service for opt-in fast analysis mode
 * Provides caching, local precompute, and compact analysis
 */

// In-memory cache for match results
const matchCache = new Map();
const MAX_CACHE_SIZE = 1000;
const CACHE_TTL = 3600000; // 1 hour

/**
 * Generate cache key from resume ID and job description
 */
export function generateCacheKey(resumeId, jobDescription) {
  const hash = crypto
    .createHash('sha256')
    .update(`${resumeId}:${jobDescription}`)
    .digest('hex');
  return hash;
}

/**
 * Get cached match result
 */
export function getCachedMatch(cacheKey) {
  const cached = matchCache.get(cacheKey);
  
  if (!cached) {
    return null;
  }
  
  // Check if expired
  if (Date.now() - cached.timestamp > CACHE_TTL) {
    matchCache.delete(cacheKey);
    return null;
  }
  
  return cached.data;
}

/**
 * Set cached match result
 */
export function setCachedMatch(cacheKey, data) {
  // Implement simple LRU by deleting oldest if cache is full
  if (matchCache.size >= MAX_CACHE_SIZE) {
    const firstKey = matchCache.keys().next().value;
    matchCache.delete(firstKey);
  }
  
  matchCache.set(cacheKey, {
    data,
    timestamp: Date.now(),
  });
}

/**
 * Extract resume summary (skills + key bullets)
 */
export function extractResumeSummary(resumeText) {
  // Extract first 500 chars + skills section
  const lines = resumeText.split('\n');
  const skillsSection = lines.find(line => 
    line.toLowerCase().includes('skill') || 
    line.toLowerCase().includes('technical')
  );
  
  const summary = resumeText.substring(0, 500);
  const skills = skillsSection || '';
  
  return `${summary}\n\nKey Skills: ${skills}`.substring(0, 800);
}

/**
 * Extract candidate sentences for bullet rewriting
 * Extracts up to 20 concise sentences from resume that could be rewritten as bullets
 */
export function extractCandidateSentences(resumeText) {
  const lines = resumeText.split('\n').filter(line => line.trim().length > 0);
  const candidates = [];
  
  // Look for bullet points or achievement-like sentences
  for (const line of lines) {
    const trimmed = line.trim();
    
    // Skip headers and short lines
    if (trimmed.length < 20 || trimmed.length > 200) continue;
    
    // Look for bullet indicators or action verbs
    const isBullet = /^[•\-\*]/.test(trimmed) || 
                     /^(Led|Developed|Built|Created|Managed|Implemented|Designed|Improved|Reduced|Increased|Achieved)/i.test(trimmed);
    
    if (isBullet) {
      candidates.push(trimmed.replace(/^[•\-\*]\s*/, ''));
    }
    
    if (candidates.length >= 20) break;
  }
  
  return candidates.length > 0 ? candidates.join('\n') : '';
}

/**
 * Extract job description summary (key requirements)
 */
export function extractJdSummary(jobDescription) {
  // Extract requirements section or first 600 chars
  const lines = jobDescription.split('\n');
  const reqSection = lines.find(line => 
    line.toLowerCase().includes('requirement') || 
    line.toLowerCase().includes('qualification')
  );
  
  const summary = jobDescription.substring(0, 600);
  const requirements = reqSection || '';
  
  return `${summary}\n\nKey Requirements: ${requirements}`.substring(0, 800);
}

/**
 * Compute local keyword match score
 */
export function computeKeywordMatch(resumeText, jobDescription) {
  const resumeLower = resumeText.toLowerCase();
  const jdLower = jobDescription.toLowerCase();
  
  // Extract keywords from job description (more dynamic)
  const jdWords = jdLower.match(/\b[a-z]{3,}\b/g) || [];
  const jdKeywords = [...new Set(jdWords)].filter(word => {
    // Filter out common words
    const commonWords = ['the', 'and', 'for', 'with', 'you', 'will', 'are', 'have', 'this', 'that', 'from', 'they', 'been', 'has', 'had', 'but', 'not', 'can', 'all', 'your', 'our', 'who', 'what', 'when', 'where', 'why', 'how'];
    return !commonWords.includes(word) && word.length >= 4;
  });
  
  // Count how many JD keywords appear in resume
  let matches = 0;
  let totalKeywords = Math.min(jdKeywords.length, 50); // Cap at 50 keywords
  
  jdKeywords.slice(0, 50).forEach(keyword => {
    if (resumeLower.includes(keyword)) {
      matches++;
    }
  });
  
  // Calculate percentage
  const matchPercentage = totalKeywords > 0 ? (matches / totalKeywords) * 100 : 0;
  
  return Math.round(Math.min(100, matchPercentage));
}

/**
 * Run local ATS checks
 */
export function runLocalAtsChecks(resumeText) {
  const issues = [];
  const recommendations = [];
  let atsScore = 100;
  
  // Check for tables and complex formatting
  if (resumeText.includes('|') || resumeText.includes('─') || resumeText.includes('═')) {
    issues.push('Contains tables or special characters that ATS cannot parse');
    recommendations.push('Use simple text format without tables or special characters');
    atsScore -= 30;
  }
  
  // Check for graphics/images indicators
  if (resumeText.includes('[image]') || resumeText.includes('[graphic]')) {
    issues.push('Contains images or graphics that ATS cannot read');
    recommendations.push('Remove all images and use text only');
    atsScore -= 25;
  }
  
  // Check for headers/footers
  if (resumeText.match(/page \d+ of \d+/i)) {
    issues.push('Contains headers or footers that may confuse ATS');
    recommendations.push('Remove headers and footers from resume');
    atsScore -= 15;
  }
  
  // Check for skills section
  if (!resumeText.toLowerCase().includes('skill')) {
    issues.push('No clear skills section found');
    recommendations.push('Add a dedicated "Skills" section with relevant keywords');
    atsScore -= 20;
  }
  
  // Check for experience section
  if (!resumeText.toLowerCase().includes('experience') && !resumeText.toLowerCase().includes('work history')) {
    issues.push('No clear experience section found');
    recommendations.push('Add a clear "Experience" or "Work History" section');
    atsScore -= 20;
  }
  
  // Check for contact information
  if (!resumeText.includes('@') && !resumeText.match(/\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/)) {
    issues.push('Missing contact information (email or phone)');
    recommendations.push('Add email address and phone number at the top');
    atsScore -= 15;
  }
  
  // Check for resume length
  if (resumeText.length < 500) {
    issues.push('Resume is too short and lacks detail');
    recommendations.push('Expand experience descriptions with achievements and metrics');
    atsScore -= 20;
  }
  
  // Check for bullet points
  const bulletCount = (resumeText.match(/[•\-\*]/g) || []).length;
  if (bulletCount < 5) {
    issues.push('Few or no bullet points found');
    recommendations.push('Use bullet points to list achievements and responsibilities');
    atsScore -= 10;
  }
  
  // Ensure score is within bounds
  atsScore = Math.max(0, Math.min(100, atsScore));
  
  return {
    atsScore,
    issues,
    recommendations,
  };
}

/**
 * Merge local results with LLM results
 * Local results take precedence for objective metrics
 */
export function mergeResults(llmResults, localResults) {
  // Use local keyword match if it's lower (more conservative)
  const keywordMatch = Math.min(
    localResults.keywordMatch || 100,
    llmResults.keyword_match || 100
  );

  // Use local ATS score if it's lower (more conservative)
  const atsScore = Math.min(
    localResults.atsScore || 100,
    llmResults.ats_score || 100
  );

  return {
    ...llmResults,
    // Override with more conservative scores
    keyword_match: keywordMatch,
    ats_score: atsScore,
    // Merge issues and recommendations (deduplicate)
    issues: [...new Set([...(llmResults.issues || []), ...(localResults.issues || [])])],
    recommendations: [...new Set([...(llmResults.recommendations || []), ...(localResults.recommendations || [])])],
  };
}
