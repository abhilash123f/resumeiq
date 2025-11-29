import { encoding_for_model } from 'tiktoken';
import config from '../config.js';

let encoder;

/**
 * Initialize tokenizer encoder
 */
function getEncoder() {
  if (!encoder) {
    try {
      // Use cl100k_base encoding (GPT-4, GPT-3.5-turbo)
      encoder = encoding_for_model('gpt-4');
    } catch (error) {
      console.warn('Failed to load tiktoken encoder, using fallback');
      encoder = null;
    }
  }
  return encoder;
}

/**
 * Count tokens in text
 * @param {string} text - Text to count
 * @returns {number} - Token count
 */
function countTokens(text) {
  const enc = getEncoder();
  if (enc) {
    return enc.encode(text).length;
  }
  // Fallback: rough estimate (1 token ≈ 4 characters)
  return Math.ceil(text.length / 4);
}

/**
 * Chunk text into token-aware segments
 * @param {string} text - Text to chunk
 * @param {number} chunkSize - Target chunk size in tokens (default from config)
 * @param {number} overlap - Overlap between chunks in tokens (default from config)
 * @returns {Promise<Array<{text: string, tokens: number, metadata: object}>>}
 */
export async function chunkText(text, chunkSize = config.chunkSize, overlap = config.chunkOverlap) {
  const chunks = [];
  
  // Split by paragraphs first
  const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 0);
  
  let currentChunk = '';
  let currentTokens = 0;
  let chunkIndex = 0;
  
  for (let i = 0; i < paragraphs.length; i++) {
    const paragraph = paragraphs[i].trim();
    const paragraphTokens = countTokens(paragraph);
    
    // If single paragraph exceeds chunk size, split it by sentences
    if (paragraphTokens > chunkSize) {
      // Save current chunk if exists
      if (currentChunk) {
        chunks.push({
          text: currentChunk.trim(),
          tokens: currentTokens,
          metadata: {
            chunkIndex: chunkIndex++,
            paragraphStart: i,
          },
        });
        currentChunk = '';
        currentTokens = 0;
      }
      
      // Split large paragraph by sentences
      const sentences = paragraph.split(/[.!?]+\s+/).filter(s => s.trim().length > 0);
      let sentenceChunk = '';
      let sentenceTokens = 0;
      
      for (const sentence of sentences) {
        const sentenceTokenCount = countTokens(sentence);
        
        if (sentenceTokens + sentenceTokenCount > chunkSize && sentenceChunk) {
          chunks.push({
            text: sentenceChunk.trim(),
            tokens: sentenceTokens,
            metadata: {
              chunkIndex: chunkIndex++,
              paragraphStart: i,
            },
          });
          
          // Add overlap from previous chunk
          const overlapText = getOverlapText(sentenceChunk, overlap);
          sentenceChunk = overlapText + ' ' + sentence;
          sentenceTokens = countTokens(sentenceChunk);
        } else {
          sentenceChunk += (sentenceChunk ? ' ' : '') + sentence;
          sentenceTokens += sentenceTokenCount;
        }
      }
      
      if (sentenceChunk) {
        currentChunk = sentenceChunk;
        currentTokens = sentenceTokens;
      }
    } else {
      // Check if adding paragraph exceeds chunk size
      if (currentTokens + paragraphTokens > chunkSize && currentChunk) {
        chunks.push({
          text: currentChunk.trim(),
          tokens: currentTokens,
          metadata: {
            chunkIndex: chunkIndex++,
            paragraphStart: i - 1,
          },
        });
        
        // Add overlap from previous chunk
        const overlapText = getOverlapText(currentChunk, overlap);
        currentChunk = overlapText + '\n\n' + paragraph;
        currentTokens = countTokens(currentChunk);
      } else {
        currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
        currentTokens += paragraphTokens;
      }
    }
  }
  
  // Add final chunk
  if (currentChunk) {
    chunks.push({
      text: currentChunk.trim(),
      tokens: currentTokens,
      metadata: {
        chunkIndex: chunkIndex++,
        paragraphStart: paragraphs.length - 1,
      },
    });
  }
  
  return chunks;
}

/**
 * Get overlap text from end of chunk
 * @param {string} text - Text to extract overlap from
 * @param {number} overlapTokens - Number of tokens for overlap
 * @returns {string} - Overlap text
 */
function getOverlapText(text, overlapTokens) {
  const words = text.split(/\s+/);
  const overlapWords = Math.min(words.length, Math.ceil(overlapTokens * 0.75)); // Rough estimate
  return words.slice(-overlapWords).join(' ');
}
