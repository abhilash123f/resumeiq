import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import fs from 'fs/promises';

/**
 * Parse resume file and extract text content
 * @param {string} filePath - Path to resume file
 * @param {string} mimeType - MIME type of file
 * @returns {Promise<{text: string, metadata: object}>}
 */
export async function parseResume(filePath, mimeType) {
  try {
    let text = '';
    let metadata = {};
    
    if (mimeType === 'application/pdf') {
      // Parse PDF
      const dataBuffer = await fs.readFile(filePath);
      const pdfData = await pdfParse(dataBuffer);
      
      text = pdfData.text;
      metadata = {
        pages: pdfData.numpages,
        info: pdfData.info,
      };
    } else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      // Parse DOCX
      const result = await mammoth.extractRawText({ path: filePath });
      text = result.value;
      metadata = {
        messages: result.messages,
      };
    } else if (mimeType === 'text/plain') {
      // Parse TXT
      text = await fs.readFile(filePath, 'utf-8');
      metadata = {};
    } else {
      throw new Error(`Unsupported file type: ${mimeType}`);
    }
    
    // Clean text
    text = cleanText(text);
    
    return { text, metadata };
  } catch (error) {
    console.error('Error parsing resume:', error);
    throw new Error(`Failed to parse resume: ${error.message}`);
  }
}

/**
 * Clean extracted text
 * @param {string} text - Raw text
 * @returns {string} - Cleaned text
 */
function cleanText(text) {
  return text
    .replace(/\r\n/g, '\n') // Normalize line endings
    .replace(/\n{3,}/g, '\n\n') // Remove excessive newlines
    .replace(/\t/g, ' ') // Replace tabs with spaces
    .replace(/[ ]{2,}/g, ' ') // Remove excessive spaces
    .trim();
}
