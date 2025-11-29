/**
 * Similarity service for vector operations
 * Computes cosine similarity and finds nearest neighbors
 */

/**
 * Calculate cosine similarity between two vectors
 * @param {number[]} vecA - First vector
 * @param {number[]} vecB - Second vector
 * @returns {number} - Similarity score (0-1)
 */
export function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length !== vecB.length) {
    throw new Error('Invalid vectors for similarity calculation');
  }
  
  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;
  
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    magnitudeA += vecA[i] * vecA[i];
    magnitudeB += vecB[i] * vecB[i];
  }
  
  magnitudeA = Math.sqrt(magnitudeA);
  magnitudeB = Math.sqrt(magnitudeB);
  
  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0;
  }
  
  return dotProduct / (magnitudeA * magnitudeB);
}

/**
 * Find most similar chunks to query embedding
 * @param {number[]} queryEmbedding - Query vector
 * @param {Array<{text: string, embedding: number[], metadata: object}>} chunks - Resume chunks with embeddings
 * @param {number} topK - Number of top results to return
 * @returns {Array<{text: string, similarity: number, metadata: object}>}
 */
export function findSimilarChunks(queryEmbedding, chunks, topK = 10) {
  if (!queryEmbedding || !chunks || chunks.length === 0) {
    return [];
  }
  
  // Calculate similarity for each chunk
  const similarities = chunks.map(chunk => {
    if (!chunk.embedding) {
      console.warn('Chunk missing embedding:', chunk);
      return {
        text: chunk.text,
        similarity: 0,
        metadata: chunk.metadata || {},
      };
    }
    
    const similarity = cosineSimilarity(queryEmbedding, chunk.embedding);
    
    return {
      text: chunk.text,
      similarity,
      metadata: chunk.metadata || {},
      tokens: chunk.tokens,
    };
  });
  
  // Sort by similarity (descending) and return top K
  return similarities
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, topK);
}

/**
 * Calculate aggregate match score from multiple similarity scores
 * @param {number[]} similarities - Array of similarity scores
 * @returns {number} - Aggregate score (0-100)
 */
export function calculateAggregateScore(similarities) {
  if (!similarities || similarities.length === 0) {
    return 0;
  }
  
  // Weighted average: top results have more weight
  let weightedSum = 0;
  let weightSum = 0;
  
  similarities.forEach((sim, index) => {
    const weight = 1 / (index + 1); // Decreasing weight
    weightedSum += sim * weight;
    weightSum += weight;
  });
  
  const avgSimilarity = weightedSum / weightSum;
  
  // Convert to 0-100 scale
  return Math.round(avgSimilarity * 100);
}

/**
 * Calculate sub-scores for different aspects
 * @param {Array} chunks - Similar chunks
 * @param {string} jobDescription - Job description text
 * @returns {object} - Breakdown scores
 */
export function calculateBreakdownScores(chunks, jobDescription) {
  const jdLower = jobDescription.toLowerCase();
  
  // Extract keywords from job description
  const skillKeywords = extractSkillKeywords(jdLower);
  const experienceKeywords = ['years', 'experience', 'worked', 'led', 'managed', 'developed'];
  
  let skillMatches = 0;
  let experienceMatches = 0;
  let keywordMatches = 0;
  
  chunks.forEach(chunk => {
    const chunkLower = chunk.text.toLowerCase();
    
    // Count skill matches
    skillKeywords.forEach(skill => {
      if (chunkLower.includes(skill)) {
        skillMatches++;
      }
    });
    
    // Count experience indicators
    experienceKeywords.forEach(keyword => {
      if (chunkLower.includes(keyword)) {
        experienceMatches++;
      }
    });
    
    // General keyword density
    keywordMatches += chunk.similarity;
  });
  
  // Normalize to 0-100
  const maxChunks = chunks.length;
  
  return {
    skills: Math.min(100, Math.round((skillMatches / Math.max(skillKeywords.length, 1)) * 100)),
    experience: Math.min(100, Math.round((experienceMatches / experienceKeywords.length) * 100)),
    keywords: Math.min(100, Math.round((keywordMatches / maxChunks) * 100)),
  };
}

/**
 * Extract skill keywords from job description
 * @param {string} text - Job description text (lowercase)
 * @returns {string[]} - Array of skill keywords
 */
function extractSkillKeywords(text) {
  const commonSkills = [
    'javascript', 'python', 'java', 'react', 'node', 'sql', 'aws', 'docker',
    'kubernetes', 'git', 'agile', 'scrum', 'api', 'rest', 'graphql',
    'typescript', 'mongodb', 'postgresql', 'redis', 'ci/cd', 'testing',
    'leadership', 'communication', 'problem solving', 'teamwork',
  ];
  
  return commonSkills.filter(skill => text.includes(skill));
}
