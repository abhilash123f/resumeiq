import { cosineSimilarity } from '../similarityService.js';

/**
 * In-memory vector store for MVP
 * Stores vectors in memory with simple nearest neighbor search
 * 
 * TODO: For production, replace with:
 * - Pinecone: Managed vector database
 * - Weaviate: Open-source vector database
 * - Redis with vector similarity search
 */

class MemoryVectorStore {
  constructor() {
    this.vectors = new Map(); // id -> { vector, metadata }
    this.collections = new Map(); // collection -> Set of ids
  }
  
  /**
   * Add vector to store
   * @param {string} id - Unique identifier
   * @param {number[]} vector - Embedding vector
   * @param {object} metadata - Associated metadata
   * @param {string} collection - Collection name (optional)
   */
  add(id, vector, metadata = {}, collection = 'default') {
    this.vectors.set(id, { vector, metadata });
    
    if (!this.collections.has(collection)) {
      this.collections.set(collection, new Set());
    }
    this.collections.get(collection).add(id);
  }
  
  /**
   * Add multiple vectors
   * @param {Array<{id: string, vector: number[], metadata: object}>} items
   * @param {string} collection - Collection name
   */
  addBatch(items, collection = 'default') {
    items.forEach(item => {
      this.add(item.id, item.vector, item.metadata, collection);
    });
  }
  
  /**
   * Query for similar vectors
   * @param {number[]} queryVector - Query embedding
   * @param {number} topK - Number of results
   * @param {string} collection - Collection to search (optional)
   * @returns {Array<{id: string, similarity: number, metadata: object}>}
   */
  query(queryVector, topK = 10, collection = null) {
    const results = [];
    
    // Determine which vectors to search
    let idsToSearch;
    if (collection && this.collections.has(collection)) {
      idsToSearch = Array.from(this.collections.get(collection));
    } else {
      idsToSearch = Array.from(this.vectors.keys());
    }
    
    // Calculate similarities
    for (const id of idsToSearch) {
      const item = this.vectors.get(id);
      if (!item) continue;
      
      const similarity = cosineSimilarity(queryVector, item.vector);
      
      results.push({
        id,
        similarity,
        metadata: item.metadata,
      });
    }
    
    // Sort by similarity and return top K
    return results
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK);
  }
  
  /**
   * Get vector by id
   * @param {string} id - Vector id
   * @returns {object|null}
   */
  get(id) {
    return this.vectors.get(id) || null;
  }
  
  /**
   * Delete vector
   * @param {string} id - Vector id
   */
  delete(id) {
    this.vectors.delete(id);
    
    // Remove from collections
    for (const [, ids] of this.collections) {
      ids.delete(id);
    }
  }
  
  /**
   * Delete collection
   * @param {string} collection - Collection name
   */
  deleteCollection(collection) {
    if (!this.collections.has(collection)) return;
    
    const ids = this.collections.get(collection);
    for (const id of ids) {
      this.vectors.delete(id);
    }
    
    this.collections.delete(collection);
  }
  
  /**
   * Clear all vectors
   */
  clear() {
    this.vectors.clear();
    this.collections.clear();
  }
  
  /**
   * Get store statistics
   */
  stats() {
    return {
      totalVectors: this.vectors.size,
      collections: Array.from(this.collections.keys()),
      collectionSizes: Object.fromEntries(
        Array.from(this.collections.entries()).map(([name, ids]) => [name, ids.size])
      ),
    };
  }
}

// Singleton instance
const memoryStore = new MemoryVectorStore();

export default memoryStore;

/**
 * TODO: Pinecone integration example
 * 
 * import { PineconeClient } from '@pinecone-database/pinecone';
 * 
 * const pinecone = new PineconeClient();
 * await pinecone.init({
 *   apiKey: config.pineconeApiKey,
 *   environment: config.pineconeEnvironment,
 * });
 * 
 * const index = pinecone.Index(config.pineconeIndex);
 * 
 * // Upsert vectors
 * await index.upsert({
 *   vectors: [
 *     { id: 'vec1', values: [0.1, 0.2, ...], metadata: {...} }
 *   ]
 * });
 * 
 * // Query
 * const results = await index.query({
 *   vector: [0.1, 0.2, ...],
 *   topK: 10,
 * });
 */

/**
 * TODO: Redis Vector Search integration example
 * 
 * import { createClient } from 'redis';
 * 
 * const redis = createClient({ url: config.redisUrl });
 * await redis.connect();
 * 
 * // Create index
 * await redis.ft.create('idx:resumes', {
 *   '$.embedding': {
 *     type: SchemaFieldTypes.VECTOR,
 *     ALGORITHM: VectorAlgorithms.HNSW,
 *     TYPE: 'FLOAT32',
 *     DIM: 1536,
 *     DISTANCE_METRIC: 'COSINE'
 *   }
 * }, { ON: 'JSON', PREFIX: 'resume:' });
 * 
 * // Store vector
 * await redis.json.set('resume:1', '$', {
 *   embedding: [0.1, 0.2, ...],
 *   metadata: {...}
 * });
 * 
 * // Search
 * const results = await redis.ft.search('idx:resumes', '*=>[KNN 10 @embedding $vec]', {
 *   PARAMS: { vec: Buffer.from(new Float32Array([0.1, 0.2, ...]).buffer) },
 *   DIALECT: 2
 * });
 */
