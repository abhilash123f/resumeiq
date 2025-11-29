import { cosineSimilarity, findSimilarChunks, calculateAggregateScore } from '../src/services/similarityService.js';

describe('Similarity Service', () => {
  describe('cosineSimilarity', () => {
    test('should calculate similarity between identical vectors', () => {
      const vec1 = [1, 0, 0];
      const vec2 = [1, 0, 0];
      const similarity = cosineSimilarity(vec1, vec2);
      expect(similarity).toBeCloseTo(1.0, 5);
    });
    
    test('should calculate similarity between orthogonal vectors', () => {
      const vec1 = [1, 0, 0];
      const vec2 = [0, 1, 0];
      const similarity = cosineSimilarity(vec1, vec2);
      expect(similarity).toBeCloseTo(0.0, 5);
    });
    
    test('should calculate similarity between opposite vectors', () => {
      const vec1 = [1, 0, 0];
      const vec2 = [-1, 0, 0];
      const similarity = cosineSimilarity(vec1, vec2);
      expect(similarity).toBeCloseTo(-1.0, 5);
    });
    
    test('should handle normalized vectors', () => {
      const vec1 = [0.6, 0.8];
      const vec2 = [0.8, 0.6];
      const similarity = cosineSimilarity(vec1, vec2);
      expect(similarity).toBeGreaterThan(0);
      expect(similarity).toBeLessThan(1);
    });
    
    test('should throw error for mismatched vector lengths', () => {
      const vec1 = [1, 0];
      const vec2 = [1, 0, 0];
      expect(() => cosineSimilarity(vec1, vec2)).toThrow();
    });
  });
  
  describe('findSimilarChunks', () => {
    const chunks = [
      {
        text: 'JavaScript developer with React experience',
        embedding: [0.9, 0.1, 0.0],
        metadata: { chunkIndex: 0 },
      },
      {
        text: 'Python backend engineer with Django',
        embedding: [0.1, 0.9, 0.0],
        metadata: { chunkIndex: 1 },
      },
      {
        text: 'Full-stack developer with JavaScript and Python',
        embedding: [0.7, 0.7, 0.0],
        metadata: { chunkIndex: 2 },
      },
    ];
    
    test('should find most similar chunks', () => {
      const queryEmbedding = [1.0, 0.0, 0.0]; // Similar to first chunk
      const results = findSimilarChunks(queryEmbedding, chunks, 2);
      
      expect(results).toHaveLength(2);
      expect(results[0].text).toContain('JavaScript');
      expect(results[0].similarity).toBeGreaterThan(results[1].similarity);
    });
    
    test('should respect topK parameter', () => {
      const queryEmbedding = [0.5, 0.5, 0.0];
      const results = findSimilarChunks(queryEmbedding, chunks, 1);
      
      expect(results).toHaveLength(1);
    });
    
    test('should return empty array for empty chunks', () => {
      const queryEmbedding = [1.0, 0.0, 0.0];
      const results = findSimilarChunks(queryEmbedding, [], 5);
      
      expect(results).toHaveLength(0);
    });
    
    test('should include metadata in results', () => {
      const queryEmbedding = [1.0, 0.0, 0.0];
      const results = findSimilarChunks(queryEmbedding, chunks, 1);
      
      expect(results[0].metadata).toBeDefined();
      expect(results[0].metadata.chunkIndex).toBe(0);
    });
  });
  
  describe('calculateAggregateScore', () => {
    test('should calculate weighted average score', () => {
      const similarities = [0.9, 0.8, 0.7, 0.6];
      const score = calculateAggregateScore(similarities);
      
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThanOrEqual(100);
    });
    
    test('should return 0 for empty array', () => {
      const score = calculateAggregateScore([]);
      expect(score).toBe(0);
    });
    
    test('should weight top results more heavily', () => {
      const highTopScore = calculateAggregateScore([0.9, 0.1, 0.1]);
      const lowTopScore = calculateAggregateScore([0.1, 0.9, 0.9]);
      
      expect(highTopScore).toBeGreaterThan(lowTopScore);
    });
  });
});
