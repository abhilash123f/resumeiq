import OpenAI from 'openai';
import axios from 'axios';
import config from '../config.js';

/**
 * Provider-agnostic LLM service
 * Supports: OpenAI, Google Gemini, Anthropic Claude, OpenRouter
 */

let openaiClient;

/**
 * Call LLM with system and user prompts
 * @param {string} systemPrompt - System instruction
 * @param {string} userPrompt - User message
 * @param {object} options - Optional configuration
 * @returns {Promise<string|object>} - LLM response
 */
export async function callLLM(systemPrompt, userPrompt, options = {}) {
  const provider = options.provider || config.aiProvider;
  const model = options.model || config.llmModel;
  const maxTokens = options.maxTokens || config.llmMaxTokens;
  const temperature = options.temperature !== undefined ? options.temperature : config.llmTemperature;
  const responseFormat = options.responseFormat; // 'json' for JSON mode
  
  let response;
  
  switch (provider) {
    case 'openai':
      response = await callOpenAI(systemPrompt, userPrompt, model, maxTokens, temperature, responseFormat);
      break;
    case 'gemini':
      response = await callGemini(systemPrompt, userPrompt, model, maxTokens, temperature, responseFormat);
      break;
    case 'anthropic':
      response = await callAnthropic(systemPrompt, userPrompt, model, maxTokens, temperature, responseFormat);
      break;
    case 'openrouter':
      response = await callOpenRouter(systemPrompt, userPrompt, model, maxTokens, temperature, responseFormat);
      break;
    case 'mock':
      response = createMockResponse(userPrompt, responseFormat);
      break;
    default:
      throw new Error(`Unsupported AI provider: ${provider}`);
  }
  
  return response;
}

/**
 * Call OpenAI API
 */
async function callOpenAI(systemPrompt, userPrompt, model, maxTokens, temperature, responseFormat) {
  if (!openaiClient) {
    if (!config.openaiApiKey) {
      throw new Error('OPENAI_API_KEY not configured');
    }
    openaiClient = new OpenAI({ apiKey: config.openaiApiKey });
  }
  
  try {
    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ];
    
    const requestOptions = {
      model: model || 'gpt-4o-mini',
      messages,
      max_tokens: maxTokens,
      temperature,
    };
    
    if (responseFormat === 'json') {
      requestOptions.response_format = { type: 'json_object' };
    }
    
    const response = await openaiClient.chat.completions.create(requestOptions);
    
    return response.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw new Error(`OpenAI API failed: ${error.message}`);
  }
}

/**
 * Call Google Gemini API
 */
async function callGemini(systemPrompt, userPrompt, model, maxTokens, temperature, responseFormat) {
  if (!config.geminiApiKey) {
    throw new Error('GEMINI_API_KEY not configured');
  }
  
  try {
    const modelName = model || 'gemini-1.5-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${config.geminiApiKey}`;
    
    const prompt = `${systemPrompt}\n\n${userPrompt}`;
    
    const requestBody = {
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        temperature,
        maxOutputTokens: maxTokens,
      },
    };
    
    if (responseFormat === 'json') {
      requestBody.generationConfig.response_mime_type = 'application/json';
    }
    
    const response = await axios.post(url, requestBody, {
      headers: { 'Content-Type': 'application/json' },
    });
    
    return response.data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Gemini API error:', error.response?.data || error);
    throw new Error(`Gemini API failed: ${error.message}`);
  }
}

/**
 * Call Anthropic Claude API
 */
async function callAnthropic(systemPrompt, userPrompt, model, maxTokens, temperature, responseFormat) {
  if (!config.anthropicApiKey) {
    throw new Error('ANTHROPIC_API_KEY not configured');
  }
  
  try {
    const url = 'https://api.anthropic.com/v1/messages';
    
    const requestBody = {
      model: model || 'claude-3-haiku-20240307',
      max_tokens: maxTokens,
      temperature,
      system: systemPrompt,
      messages: [
        { role: 'user', content: userPrompt }
      ],
    };
    
    const response = await axios.post(url, requestBody, {
      headers: {
        'x-api-key': config.anthropicApiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
    });
    
    return response.data.content[0].text;
  } catch (error) {
    console.error('Anthropic API error:', error.response?.data || error);
    throw new Error(`Anthropic API failed: ${error.message}`);
  }
}

/**
 * Call OpenRouter API with automatic retry on rate limit
 */
async function callOpenRouter(systemPrompt, userPrompt, model, maxTokens, temperature, responseFormat) {
  const openrouterKey = process.env.OPENROUTER_API_KEY;
  
  if (!openrouterKey) {
    throw new Error('OPENROUTER_API_KEY not configured');
  }
  
  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ];
  
  const requestBody = {
    model: model || 'google/gemini-flash-1.5',
    messages,
    max_tokens: maxTokens,
    temperature,
  };
  
  if (responseFormat === 'json') {
    requestBody.response_format = { type: 'json_object' };
  }
  
  const maxRetries = 3;
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        requestBody,
        {
          headers: {
            'Authorization': `Bearer ${openrouterKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'http://localhost:5173',
            'X-Title': 'AI Resume Matcher',
          },
        }
      );
      
      return response.data.choices[0].message.content;
    } catch (error) {
      lastError = error;
      const is429 = error.response?.status === 429;
      
      if (is429 && attempt < maxRetries) {
        const waitTime = attempt * 5000; // 5s, 10s, 15s
        console.log(`⚠ Rate limited. Retrying in ${waitTime/1000}s... (Attempt ${attempt}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }
      
      console.error('OpenRouter API error:', error.response?.data || error);
      
      if (is429) {
        throw new Error('OpenRouter rate limit exceeded. Please wait a moment and try again.');
      }
      
      throw new Error(`OpenRouter API failed: ${error.message}`);
    }
  }
  
  throw lastError;
}

/**
 * Create mock response for testing
 */
function createMockResponse(userPrompt, responseFormat) {
  if (responseFormat === 'json') {
    return JSON.stringify({
      score: 75,
      breakdown: {
        skills: 80,
        experience: 70,
        keywords: 75,
      },
      missingSkills: ['Docker', 'Kubernetes'],
      strengths: ['Strong JavaScript experience', 'Good communication skills'],
      weaknesses: ['Limited cloud experience'],
      explanation: 'This is a mock response for testing purposes.',
      rewrittenBullets: ['Mock bullet point 1', 'Mock bullet point 2'],
      passesATS: true,
      issues: [],
      recommendations: ['Add more keywords', 'Quantify achievements'],
    });
  }
  
  return 'This is a mock LLM response for testing purposes.';
}
