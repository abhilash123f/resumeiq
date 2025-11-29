import puppeteer from 'puppeteer';
import fs from 'fs/promises';
import path from 'path';

/**
 * Generate PDF from HTML content
 * @param {string} htmlContent - HTML content to convert
 * @param {string} outputPath - Output PDF file path
 * @param {object} options - PDF generation options
 * @returns {Promise<string>} - Path to generated PDF
 */
export async function generatePDF(htmlContent, outputPath, options = {}) {
  let browser;
  
  try {
    // Launch browser
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
      ],
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
    });
    
    const page = await browser.newPage();
    
    // Set content
    await page.setContent(htmlContent, {
      waitUntil: 'networkidle0',
    });
    
    // Generate PDF
    await page.pdf({
      path: outputPath,
      format: options.format || 'A4',
      printBackground: true,
      margin: options.margin || {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm',
      },
    });
    
    return outputPath;
  } catch (error) {
    console.error('PDF generation error:', error);
    throw new Error(`Failed to generate PDF: ${error.message}`);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

/**
 * Generate resume PDF from tailored bullets
 * @param {object} resumeData - Resume data with tailored bullets
 * @param {string} outputDir - Output directory
 * @returns {Promise<string>} - Path to generated PDF
 */
export async function generateTailoredResumePDF(resumeData, outputDir) {
  const { originalText, tailoredBullets, jobDescription } = resumeData;
  
  // Create HTML template
  const html = createResumeHTML(originalText, tailoredBullets, jobDescription);
  
  // Ensure output directory exists
  await fs.mkdir(outputDir, { recursive: true });
  
  // Generate unique filename
  const timestamp = Date.now();
  const outputPath = path.join(outputDir, `tailored-resume-${timestamp}.pdf`);
  
  // Generate PDF
  await generatePDF(html, outputPath);
  
  return outputPath;
}

/**
 * Create HTML template for resume
 * @param {string} originalText - Original resume text
 * @param {string[]} tailoredBullets - Tailored bullet points
 * @param {string} jobDescription - Job description
 * @returns {string} - HTML content
 */
function createResumeHTML(originalText, tailoredBullets, jobDescription) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tailored Resume</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Helvetica', 'Arial', sans-serif;
      font-size: 11pt;
      line-height: 1.4;
      color: #333;
    }
    
    .container {
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    
    .header {
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 2px solid #333;
    }
    
    .section {
      margin-bottom: 20px;
    }
    
    .section-title {
      font-size: 14pt;
      font-weight: bold;
      margin-bottom: 10px;
      text-transform: uppercase;
      color: #2c3e50;
    }
    
    .tailored-section {
      background-color: #f8f9fa;
      padding: 15px;
      border-left: 4px solid #3498db;
      margin-bottom: 20px;
    }
    
    .bullet-list {
      list-style-type: disc;
      margin-left: 20px;
    }
    
    .bullet-list li {
      margin-bottom: 8px;
    }
    
    .note {
      font-size: 9pt;
      color: #7f8c8d;
      font-style: italic;
      margin-top: 10px;
    }
    
    .original-content {
      white-space: pre-wrap;
      font-size: 10pt;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Tailored Resume</h1>
      <p class="note">Generated with AI Resume Matcher</p>
    </div>
    
    ${tailoredBullets && tailoredBullets.length > 0 ? `
    <div class="tailored-section">
      <div class="section-title">AI-Tailored Highlights</div>
      <ul class="bullet-list">
        ${tailoredBullets.map(bullet => `<li>${escapeHtml(bullet)}</li>`).join('\n        ')}
      </ul>
      <p class="note">
        These bullets have been optimized for the target role and ATS compatibility.
        Review and integrate them into your resume as appropriate.
      </p>
    </div>
    ` : ''}
    
    <div class="section">
      <div class="section-title">Original Resume Content</div>
      <div class="original-content">${escapeHtml(originalText)}</div>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Escape HTML special characters
 * @param {string} text - Text to escape
 * @returns {string} - Escaped text
 */
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}
