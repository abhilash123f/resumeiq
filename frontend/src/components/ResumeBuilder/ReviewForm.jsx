import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function ReviewForm({ resumeData, onBack }) {
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState('My Resume');
  const navigate = useNavigate();

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/resume-builder/save`,
        {
          title,
          content: resumeData,
          template: 'professional',
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert('Resume saved successfully!');
      navigate('/dashboard');
    } catch (err) {
      alert('Failed to save resume');
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = () => {
    const content = `
${resumeData.personalInfo.name}
${resumeData.personalInfo.email} | ${resumeData.personalInfo.phone}
${resumeData.personalInfo.location}

PROFESSIONAL SUMMARY
${resumeData.summary}

SKILLS
${resumeData.skills.technical.join(', ')}

EXPERIENCE
${resumeData.experience.map(exp => `
${exp.role} at ${exp.company}
${exp.bullets.map(b => `• ${b}`).join('\n')}
`).join('\n')}
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${resumeData.personalInfo.name.replace(/\s+/g, '_')}_Resume.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Review & Save</h2>

      <div className="space-y-4 mb-6">
        <div>
          <label className="label">Resume Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input"
            placeholder="My Professional Resume"
          />
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Resume Summary:</h3>
          <ul className="space-y-1 text-sm">
            <li>✓ Personal Information: Complete</li>
            <li>✓ Summary: {resumeData.summary ? 'Added' : 'Not added'}</li>
            <li>✓ Experience: {resumeData.experience.length} entries</li>
            <li>✓ Skills: {resumeData.skills.technical.length} skills</li>
          </ul>
        </div>
      </div>

      <div className="space-y-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn btn-primary w-full"
        >
          {saving ? 'Saving...' : '💾 Save Resume'}
        </button>

        <button
          onClick={handleDownload}
          className="btn btn-outline w-full"
        >
          📥 Download as Text
        </button>

        <button onClick={onBack} className="btn btn-secondary w-full">
          Back to Edit
        </button>
      </div>
    </div>
  );
}

export default ReviewForm;
