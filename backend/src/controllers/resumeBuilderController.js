import { callLLM } from '../services/llmService.js';
import BuiltResume from '../models/BuiltResume.js';

/**
 * Generate professional summary using AI
 */
export const generateSummary = async (req, res, next) => {
  try {
    const { jobTitle, experience, skills, targetRole } = req.body;
    
    if (!jobTitle || !experience) {
      return res.status(400).json({ error: 'jobTitle and experience required' });
    }
    
    const prompt = `Generate a professional resume summary (2-3 sentences) for:
Job Title: ${jobTitle}
Years of Experience: ${experience}
Key Skills: ${skills || 'Not specified'}
Target Role: ${targetRole || jobTitle}

Requirements:
- Professional and concise
- Highlight key strengths
- Include measurable achievements if possible
- ATS-friendly language

Return ONLY the summary text, no extra formatting.`;
    
    const summary = await callLLM(
      'You are a professional resume writer.',
      prompt
    );
    
    res.json({ summary: summary.trim() });
  } catch (error) {
    next(error);
  }
};

/**
 * Generate bullet points for experience/projects
 */
export const generateBullets = async (req, res, next) => {
  try {
    const { role, company, description, achievements } = req.body;
    
    if (!role || !description) {
      return res.status(400).json({ error: 'role and description required' });
    }
    
    const prompt = `Generate 3-5 professional bullet points for this role:
Role: ${role}
Company: ${company || 'Not specified'}
Description: ${description}
Key Achievements: ${achievements || 'Not specified'}

Requirements:
- Start with strong action verbs
- Include metrics and numbers where possible
- Focus on impact and results
- ATS-friendly
- Each bullet should be 1-2 lines

Return as JSON array: {"bullets": ["bullet 1", "bullet 2", ...]}`;
    
    const response = await callLLM(
      'You are a professional resume writer. Return ONLY valid JSON.',
      prompt,
      { responseFormat: 'json' }
    );
    
    const data = typeof response === 'string' ? JSON.parse(response) : response;
    
    res.json({ bullets: data.bullets || [] });
  } catch (error) {
    next(error);
  }
};

/**
 * Generate relevant skills based on role
 */
export const generateSkills = async (req, res, next) => {
  try {
    const { jobTitle, experience, industry } = req.body;
    
    if (!jobTitle) {
      return res.status(400).json({ error: 'jobTitle required' });
    }
    
    const prompt = `Generate relevant skills for:
Job Title: ${jobTitle}
Experience Level: ${experience || 'Mid-level'}
Industry: ${industry || 'Technology'}

Requirements:
- Mix of technical and soft skills
- Industry-relevant
- ATS-friendly keywords
- 8-12 skills total

Return as JSON: {"technical": ["skill1", "skill2"], "soft": ["skill1", "skill2"]}`;
    
    const response = await callLLM(
      'You are a professional resume writer. Return ONLY valid JSON.',
      prompt,
      { responseFormat: 'json' }
    );
    
    const data = typeof response === 'string' ? JSON.parse(response) : response;
    
    res.json({ 
      technical: data.technical || [],
      soft: data.soft || []
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Build full resume from user input
 */
export const buildFullResume = async (req, res, next) => {
  try {
    const { personalInfo, targetRole, experience, education, projects } = req.body;
    
    if (!personalInfo || !targetRole) {
      return res.status(400).json({ error: 'personalInfo and targetRole required' });
    }
    
    const prompt = `Create a complete professional resume for:

Personal Info: ${JSON.stringify(personalInfo)}
Target Role: ${targetRole}
Experience: ${JSON.stringify(experience || [])}
Education: ${JSON.stringify(education || [])}
Projects: ${JSON.stringify(projects || [])}

Generate:
1. Professional summary (2-3 sentences)
2. Enhanced bullet points for each experience
3. Relevant skills list
4. Optimized for ATS

Return as JSON:
{
  "summary": "...",
  "experience": [{"company": "...", "role": "...", "bullets": ["..."]}],
  "skills": {"technical": [...], "soft": [...]},
  "suggestions": ["improvement 1", "improvement 2"]
}`;
    
    const response = await callLLM(
      'You are a professional resume writer. Return ONLY valid JSON.',
      prompt,
      { responseFormat: 'json' }
    );
    
    const data = typeof response === 'string' ? JSON.parse(response) : response;
    
    res.json(data);
  } catch (error) {
    next(error);
  }
};

/**
 * Get user's built resumes
 */
export const getBuilderResumes = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    
    const resumes = await BuiltResume.find({ userId })
      .sort({ updatedAt: -1 })
      .limit(20);
    
    res.json({ resumes });
  } catch (error) {
    next(error);
  }
};

/**
 * Save built resume
 */
export const saveBuilderResume = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { title, content, template } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ error: 'title and content required' });
    }
    
    const resume = await BuiltResume.create({
      userId,
      title,
      content,
      template: template || 'professional',
    });
    
    res.status(201).json({ 
      message: 'Resume saved successfully',
      resume 
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete built resume
 */
export const deleteBuilderResume = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    
    const resume = await BuiltResume.findOneAndDelete({ _id: id, userId });
    
    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }
    
    res.json({ message: 'Resume deleted successfully' });
  } catch (error) {
    next(error);
  }
};
