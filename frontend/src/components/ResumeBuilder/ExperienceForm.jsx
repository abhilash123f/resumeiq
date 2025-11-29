import { useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function ExperienceForm({ experience, education, projects, onUpdate, onNext, onBack }) {
  const [currentExp, setCurrentExp] = useState({
    company: '',
    role: '',
    location: '',
    startDate: '',
    endDate: '',
    description: '',
    bullets: [],
  });
  const [generating, setGenerating] = useState(false);

  const handleGenerateBullets = async () => {
    if (!currentExp.role || !currentExp.description) {
      alert('Please fill role and description first');
      return;
    }

    setGenerating(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/resume-builder/generate-bullets`,
        {
          role: currentExp.role,
          company: currentExp.company,
          description: currentExp.description,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setCurrentExp({ ...currentExp, bullets: response.data.bullets });
    } catch (err) {
      alert('Failed to generate bullets');
    } finally {
      setGenerating(false);
    }
  };

  const addExperience = () => {
    if (currentExp.company && currentExp.role) {
      onUpdate('experience', [...experience, currentExp]);
      setCurrentExp({
        company: '',
        role: '',
        location: '',
        startDate: '',
        endDate: '',
        description: '',
        bullets: [],
      });
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Experience & Education</h2>

      <div className="space-y-4 mb-6">
        <h3 className="font-semibold text-lg">Add Work Experience</h3>

        <div className="grid md:grid-cols-2 gap-4">
          <input
            type="text"
            value={currentExp.company}
            onChange={(e) => setCurrentExp({ ...currentExp, company: e.target.value })}
            className="input"
            placeholder="Company Name"
          />
          <input
            type="text"
            value={currentExp.role}
            onChange={(e) => setCurrentExp({ ...currentExp, role: e.target.value })}
            className="input"
            placeholder="Job Title"
          />
        </div>

        <textarea
          value={currentExp.description}
          onChange={(e) => setCurrentExp({ ...currentExp, description: e.target.value })}
          className="input"
          placeholder="Brief description of your role..."
          rows="2"
        />

        <button
          onClick={handleGenerateBullets}
          disabled={generating}
          className="btn btn-outline w-full"
        >
          {generating ? '✨ Generating...' : '✨ Generate Bullet Points with AI'}
        </button>

        {currentExp.bullets.length > 0 && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="font-semibold mb-2">Generated Bullets:</p>
            <ul className="list-disc list-inside space-y-1">
              {currentExp.bullets.map((bullet, i) => (
                <li key={i} className="text-sm">{bullet}</li>
              ))}
            </ul>
          </div>
        )}

        <button onClick={addExperience} className="btn btn-secondary w-full">
          Add Experience
        </button>

        {experience.length > 0 && (
          <div className="mt-4">
            <p className="font-semibold mb-2">Added Experiences:</p>
            {experience.map((exp, i) => (
              <div key={i} className="bg-primary-50 p-3 rounded mb-2">
                <p className="font-semibold">{exp.role} at {exp.company}</p>
                <p className="text-sm text-gray-600">{exp.bullets.length} bullet points</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-4">
        <button onClick={onBack} className="btn btn-secondary flex-1">
          Back
        </button>
        <button onClick={onNext} className="btn btn-primary flex-1">
          Continue to Review
        </button>
      </div>
    </div>
  );
}

export default ExperienceForm;
