import OpenAI from 'openai';
import axios from 'axios';
import config from '../config.js';

/**
 * Provider-agnostic embedding service
 * Supports: OpenAI, Cohere, HuggingFace
 */

let openaiClient;
let cohereClient;

/**
 * Create embeddings for array of texts
 * @param {string[]} texts - Array of texts to embed
 * @param {object} options - Optional configuration
 * @returns {Promise<number[][]>} - Array of embedding vectors
 */
export async function createEmbeddings(texts, options = {}) {
  const provider = options.provider || config.embeddingProvider;
  const model = options.model || config.embeddingModel;
  
  if (!texts || texts.length === 0) {
    throw new Error('No texts provided for embedding');
  }
  
  // Batch texts to avoid rate limits (max 100 per request for most providers)
  const batchSize = 100;
  const batches = [];
  
  for (let i = 0; i < texts.length; i += batchSize) {
    batches.push(texts.slice(i, i + batchSize));
  }
  
  const allEmbeddings = [];
  
  for (const batch of batches) {
    let embeddings;
    
    switch (provider) {
      case 'openai':
        embeddings = await createOpenAIEmbeddings(batch, model);
        break;
      case 'cohere':
        embeddings = await createCohereEmbeddings(batch, model);
        break;
      case 'huggingface':
        embeddings = await createHuggingFaceEmbeddings(batch, model);
        break;
      case 'mock':
        embeddings = createMockEmbeddings(batch);
        break;
      default:
        throw new Error(`Unsupported embedding provider: ${provider}`);
    }
    
    allEmbeddings.push(...embeddings);
  }
  
  return allEmbeddings;
}

/**
 * Create embeddings using OpenAI
 */
async function createOpenAIEmbeddings(texts, model) {
  if (!openaiClient) {
    if (!config.openaiApiKey) {
      throw new Error('OPENAI_API_KEY not configured');
    }
    openaiClient = new OpenAI({ apiKey: config.openaiApiKey });
  }
  
  try {
    const response = await openaiClient.embeddings.create({
      model: model || 'text-embedding-3-small',
      input: texts,
    });
    
    return response.data.map(item => item.embedding);
  } catch (error) {
    console.error('OpenAI embedding error:', error);
    throw new Error(`OpenAI embedding failed: ${error.message}`);
  }
}

/**
 * Create embeddings using Cohere
 */
async function createCohereEmbeddings(texts, model) {
  if (!config.cohereApiKey) {
    throw new Error('COHERE_API_KEY not configured');
  }
  
  try {
    const response = await axios.post(
      'https://api.cohere.ai/v1/embed',
      {
        texts,
        model: model || 'embed-english-v3.0',
        input_type: 'search_document',
      },
      {
        headers: {
          'Authorization': `Bearer ${config.cohereApiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    return response.data.embeddings;
  } catch (error) {
    console.error('Cohere embedding error:', error);
    throw new Error(`Cohere embedding failed: ${error.message}`);
  }
}

/**
 * Create embeddings using HuggingFace Inference API
 */
async function createHuggingFaceEmbeddings(texts, model) {
  const hfToken = process.env.HUGGINGFACE_API_KEY;
  if (!hfToken) {
    throw new Error('HUGGINGFACE_API_KEY not configured');
  }
  
  const modelName = model || 'sentence-transformers/all-MiniLM-L6-v2';
  
  try {
    const embeddings = [];
    
    // HuggingFace API processes one text at a time
    for (const text of texts) {
      const response = await axios.post(
        `https://api-inference.huggingface.co/models/${modelName}`,
        { inputs: text },
        {
          headers: {
            'Authorization': `Bearer ${hfToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      embeddings.push(response.data);
    }
    
    return embeddings;
  } catch (error) {
    console.error('HuggingFace embedding error:', error);
    throw new Error(`HuggingFace embedding failed: ${error.message}`);
  }
}

/**
 * Create mock embeddings for testing (random vectors)
 */
function createMockEmbeddings(texts) {
  const dimension = config.embeddingDimensions || 1536;
  return texts.map(() => {
    const embedding = [];
    for (let i = 0; i < dimension; i++) {
      embedding.push(Math.random() * 2 - 1); // Random values between -1 and 1
    }
    // Normalize
    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    return embedding.map(val => val / magnitude);
  });
}
