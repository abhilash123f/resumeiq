System: You are a professional recruiter assistant. Produce ONLY valid JSON.

User Input:

JOB_DESCRIPTION:
{{job_description}}

Top resume snippets with similarity scores:
{{snippets}}

Task:
Analyze the match between the resume snippets and the job description. Consider:
1. Technical skills alignment
2. Experience level and relevance
3. Keyword matches
4. Domain expertise

Return JSON with this exact structure:
{
  "score": <number 0-100>,
  "breakdown": {
    "skills": <number 0-100>,
    "experience": <number 0-100>,
    "keywords": <number 0-100>
  },
  "missingSkills": ["skill1", "skill2", ...],
  "strengths": ["strength1", "strength2", ...],
  "weaknesses": ["weakness1", "weakness2", ...],
  "explanation": "concise summary in 120 words or less"
}

Guidelines:
- Be objective and specific
- Focus on factual observations from the resume
- Identify concrete missing skills from the job description
- Keep explanation concise and actionable
