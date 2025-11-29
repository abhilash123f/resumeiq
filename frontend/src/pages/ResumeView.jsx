import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function ResumeView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadResume();
  }, [id]);

  const loadResume = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/resume-builder`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const found = response.data.resumes.find(r => r._id === id);
      setResume(found);
    } catch (err) {
      console.error('Failed to load resume:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!resume) return;

    const { content } = resume;
    const text = `
${content.personalInfo.name}
${content.personalInfo.email} | ${content.personalInfo.phone || ''}
${content.personalInfo.location || ''}
${content.personalInfo.linkedin || ''} ${content.personalInfo.website || ''}

PROFESSIONAL SUMMARY
${content.summary || 'Not provided'}

SKILLS
${content.skills?.technical?.join(', ') || 'Not provided'}

EXPERIENCE
${content.experience?.map(exp => `
${exp.role} at ${exp.company}
${exp.startDate || ''} - ${exp.endDate || 'Present'}
${exp.bullets?.map(b => `• ${b}`).join('\n') || ''}
`).join('\n') || 'Not provided'}

EDUCATION
${content.education?.map(edu => `
${edu.degree} in ${edu.field || ''}
${edu.school}
${edu.graduationDate || ''}
`).join('\n') || 'Not provided'}

PROJECTS
${content.projects?.map(proj => `
${proj.name}
${proj.description || ''}
Technologies: ${proj.technologies?.join(', ') || ''}
`).join('\n') || 'Not provided'}
    `.trim();

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${resume.title.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!resume) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="card text-center py-12">
          <h2 className="text-xl font-semibold mb-2">Resume not found</h2>
          <button onClick={() => navigate('/my-resumes')} className="btn btn-primary mt-4">
            Back to My Resumes
          </button>
        </div>
      </div>
    );
  }

  const { content } = resume;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">{resume.title}</h1>
            <p className="text-gray-600 text-sm">
              Last updated: {new Date(resume.updatedAt).toLocaleDateString()}
            </p>
          </div>
          <div className="flex gap-3">
            <button onClick={handleDownload} className="btn btn-primary">
              📥 Download
            </button>
            <button onClick={() => navigate('/my-resumes')} className="btn btn-secondary">
              Back
            </button>
          </div>
        </div>

        {/* Resume Content */}
        <div className="card bg-white shadow-lg p-8">
          {/* Personal Info */}
          <div className="text-center mb-8 pb-6 border-b-2 border-gray-300">
            <h1 className="text-3xl font-bold mb-3">{content.personalInfo.name}</h1>
            <div className="text-gray-700 space-y-1">
              <p>{content.personalInfo.email} {content.personalInfo.phone && `• ${content.personalInfo.phone}`}</p>
              {content.personalInfo.location && <p>{content.personalInfo.location}</p>}
              <div className="flex justify-center gap-4 text-primary-600 text-sm mt-2">
                {content.personalInfo.linkedin && (
                  <a 
                    href={content.personalInfo.linkedin.startsWith('http') ? content.personalInfo.linkedin : `https://${content.personalInfo.linkedin}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="hover:underline"
                    onClick={(e) => {
                      try {
                        const url = content.personalInfo.linkedin.startsWith('http') 
                          ? content.personalInfo.linkedin 
                          : `https://${content.personalInfo.linkedin}`;
                        new URL(url);
                      } catch (err) {
                        e.preventDefault();
                        alert('Invalid LinkedIn URL. Please update your resume with a valid URL.');
                      }
                    }}
                  >
                    LinkedIn
                  </a>
                )}
                {content.personalInfo.website && (
                  <a 
                    href={content.personalInfo.website.startsWith('http') ? content.personalInfo.website : `https://${content.personalInfo.website}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="hover:underline"
                    onClick={(e) => {
                      try {
                        const url = content.personalInfo.website.startsWith('http') 
                          ? content.personalInfo.website 
                          : `https://${content.personalInfo.website}`;
                        new URL(url);
                      } catch (err) {
                        e.preventDefault();
                        alert('Invalid Website URL. Please update your resume with a valid URL.');
                      }
                    }}
                  >
                    Website
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Summary */}
          {content.summary && (
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-3 text-gray-800 uppercase border-b pb-2">
                Professional Summary
              </h2>
              <p className="text-gray-700 leading-relaxed">{content.summary}</p>
            </div>
          )}

          {/* Skills */}
          {content.skills?.technical?.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-3 text-gray-800 uppercase border-b pb-2">
                Skills
              </h2>
              <div className="flex flex-wrap gap-2">
                {content.skills.technical.map((skill, i) => (
                  <span key={i} className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Experience */}
          {content.experience?.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-4 text-gray-800 uppercase border-b pb-2">
                Experience
              </h2>
              {content.experience.map((exp, i) => (
                <div key={i} className="mb-6">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-lg">{exp.role}</h3>
                      <p className="text-gray-700">{exp.company}</p>
                      {exp.location && <p className="text-gray-600 text-sm">{exp.location}</p>}
                    </div>
                    {exp.startDate && (
                      <span className="text-gray-600 text-sm whitespace-nowrap">
                        {exp.startDate} - {exp.endDate || 'Present'}
                      </span>
                    )}
                  </div>
                  {exp.bullets?.length > 0 && (
                    <ul className="list-disc list-outside ml-5 text-gray-700 space-y-2 mt-3">
                      {exp.bullets.map((bullet, j) => (
                        <li key={j}>{bullet}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Education */}
          {content.education?.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-4 text-gray-800 uppercase border-b pb-2">
                Education
              </h2>
              {content.education.map((edu, i) => (
                <div key={i} className="mb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold">{edu.degree} {edu.field && `in ${edu.field}`}</h3>
                      <p className="text-gray-700">{edu.school}</p>
                      {edu.gpa && <p className="text-gray-600 text-sm">GPA: {edu.gpa}</p>}
                    </div>
                    {edu.graduationDate && (
                      <span className="text-gray-600 text-sm">{edu.graduationDate}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Projects */}
          {content.projects?.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-4 text-gray-800 uppercase border-b pb-2">
                Projects
              </h2>
              {content.projects.map((proj, i) => (
                <div key={i} className="mb-4">
                  <h3 className="font-bold">{proj.name}</h3>
                  {proj.description && <p className="text-gray-700 mt-1">{proj.description}</p>}
                  {proj.technologies?.length > 0 && (
                    <p className="text-gray-600 text-sm mt-1">
                      <span className="font-semibold">Technologies:</span> {proj.technologies.join(', ')}
                    </p>
                  )}
                  {proj.link && (
                    <a 
                      href={proj.link.startsWith('http') ? proj.link : `https://${proj.link}`} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-primary-600 text-sm hover:underline"
                    >
                      View Project →
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Certifications */}
          {content.certifications?.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-4 text-gray-800 uppercase border-b pb-2">
                Certifications
              </h2>
              {content.certifications.map((cert, i) => (
                <div key={i} className="mb-2">
                  <p className="font-semibold">{cert.name}</p>
                  <p className="text-gray-600 text-sm">{cert.issuer} {cert.date && `• ${cert.date}`}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ResumeView;
