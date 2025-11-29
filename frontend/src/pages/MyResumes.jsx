import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function MyResumes() {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadResumes();
  }, []);

  const loadResumes = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/resume-builder`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setResumes(response.data.resumes);
    } catch (err) {
      console.error('Failed to load resumes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this resume?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/resume-builder/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setResumes(resumes.filter((r) => r._id !== id));
    } catch (err) {
      alert('Failed to delete resume');
    }
  };

  const handleDownload = (resume) => {
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

  const handleView = (resume) => {
    // Store in sessionStorage to view
    sessionStorage.setItem('viewResume', JSON.stringify(resume));
    navigate(`/resume-view/${resume._id}`);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Resumes</h1>
          <p className="text-gray-600">View and manage your saved resumes</p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => navigate('/resume-builder')}
            className="btn btn-primary"
          >
            + Create New Resume
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="btn btn-secondary"
          >
            Back to Dashboard
          </button>
        </div>
      </div>

      {resumes.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-6xl mb-4">📄</div>
          <h2 className="text-xl font-semibold mb-2">No resumes yet</h2>
          <p className="text-gray-600 mb-6">
            Create your first resume with AI assistance
          </p>
          <button
            onClick={() => navigate('/resume-builder')}
            className="btn btn-primary"
          >
            Create Resume
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resumes.map((resume) => (
            <div key={resume._id} className="card hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">{resume.title}</h3>
                  <p className="text-sm text-gray-600">
                    {new Date(resume.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded">
                  {resume.template}
                </span>
              </div>

              <div className="text-sm text-gray-600 mb-4">
                <p>📧 {resume.content.personalInfo.email}</p>
                {resume.content.experience?.length > 0 && (
                  <p>💼 {resume.content.experience.length} experiences</p>
                )}
                {resume.content.skills?.technical?.length > 0 && (
                  <p>🎯 {resume.content.skills.technical.length} skills</p>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleView(resume)}
                  className="btn btn-outline flex-1 text-sm"
                >
                  👁️ View
                </button>
                <button
                  onClick={() => handleDownload(resume)}
                  className="btn btn-outline flex-1 text-sm"
                >
                  📥 Download
                </button>
                <button
                  onClick={() => handleDelete(resume._id)}
                  className="btn btn-secondary text-sm"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyResumes;
