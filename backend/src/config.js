import dotenv from 'dotenv';

dotenv.config();

const config = {
  // Environment
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  
  // Database
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/resume-matcher',
  
  // JWT
  jwtSecret: process.env.JWT_SECRET || 'change-this-secret-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  
  // AI Provider Configuration
  // Supported: 'openai', 'gemini', 'anthropic', 'openrouter', 'mock'
  aiProvider: process.env.AI_PROVIDER || 'openai',
  
  // API Keys - TODO: ADD API KEY for your chosen provider
  openaiApiKey: process.env.OPENAI_API_KEY,
  geminiApiKey: process.env.GEMINI_API_KEY,
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  openrouterApiKey: process.env.OPENROUTER_API_KEY,
  cohereApiKey: process.env.COHERE_API_KEY,
  
  // Embedding Provider
  // Supported: 'openai', 'cohere', 'huggingface'
  embeddingProvider: process.env.EMBEDDING_PROVIDER || 'openai',
  embeddingModel: process.env.EMBEDDING_MODEL || 'text-embedding-3-small',
  embeddingDimensions: parseInt(process.env.EMBEDDING_DIMENSIONS || '1536', 10),
  
  // LLM Configuration
  llmModel: process.env.LLM_MODEL || 'gpt-4o-mini',
  llmMaxTokens: parseInt(process.env.LLM_MAX_TOKENS || '2000', 10),
  llmTemperature: parseFloat(process.env.LLM_TEMPERATURE || '0.3'),
  
  // Vector Store
  // Supported: 'memory', 'pinecone', 'redis'
  vectorStore: process.env.VECTOR_STORE || 'memory',
  
  // Pinecone - TODO: ADD API KEY if using Pinecone
  pineconeApiKey: process.env.PINECONE_API_KEY,
  pineconeEnvironment: process.env.PINECONE_ENVIRONMENT,
  pineconeIndex: process.env.PINECONE_INDEX,
  
  // Redis
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  
  // Rate Limiting
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 min
  rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  
  // File Upload
  maxFileSizeMB: parseInt(process.env.MAX_FILE_SIZE_MB || '10', 10),
  uploadDir: process.env.UPLOAD_DIR || './uploads',
  allowedFileTypes: ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'],
  
  // CORS
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  
  // Chunking
  chunkSize: parseInt(process.env.CHUNK_SIZE || '300', 10), // tokens
  chunkOverlap: parseInt(process.env.CHUNK_OVERLAP || '50', 10), // tokens
  
  // Logging
  logLevel: process.env.LOG_LEVEL || 'info',
};

// Validation
if (config.aiProvider !== 'mock') {
  const providerKey = `${config.aiProvider}ApiKey`;
  if (!config[providerKey]) {
    console.warn(`⚠ Warning: ${config.aiProvider.toUpperCase()}_API_KEY not set. AI features will not work.`);
  }
}

if (config.embeddingProvider !== 'mock') {
  const embeddingKey = `${config.embeddingProvider}ApiKey`;
  if (!config[embeddingKey]) {
    console.warn(`⚠ Warning: ${config.embeddingProvider.toUpperCase()}_API_KEY not set for embeddings.`);
  }
}

export default config;
