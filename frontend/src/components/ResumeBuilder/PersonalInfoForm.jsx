import { useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function PersonalInfoForm({ data, summary, skills, onUpdate, onNext, onBack }) {
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [urlErrors, setUrlErrors] = useState({
    linkedin: '',
    website: '',
  });

  const validateUrl = async (url, type) => {
    if (!url) {
      setUrlErrors(prev => ({ ...prev, [type]: '' }));
      return true;
    }

    // Add https:// if not present
    let fullUrl = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      fullUrl = 'https://' + url;
    }

    // Basic URL format validation
    try {
      new URL(fullUrl);
      
      // Check if URL is reachable (optional - can be slow)
      // For now, just validate format
      setUrlErrors(prev => ({ ...prev, [type]: '' }));
      return true;
    } catch (e) {
      setUrlErrors(prev => ({ 
        ...prev, 
        [type]: `Invalid ${type} URL. Please enter a valid URL (e.g., linkedin.com/in/yourname)` 
      }));
      return false;
    }
  };

  const handleUrlBlur = (value, type) => {
    validateUrl(value, type);
  };

  const handleGenerateSummary = async () => {
    if (!data.name) {
      setError('Please enter your name first');
      return;
    }

    setGenerating(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/resume-builder/generate-summary`,
        {
          jobTitle: 'Professional', // Can be customized
          experience: '3-5 years',
          skills: skills.technical.join(', '),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      onUpdate('summary', response.data.summary);
    } catch (err) {
      setError('Failed to generate summary');
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerateSkills = async () => {
    setGenerating(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/resume-builder/generate-skills`,
        {
          jobTitle: 'Software Developer',
          experience: 'Mid-level',
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      onUpdate('skills', response.data);
    } catch (err) {
      setError('Failed to generate skills');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Personal Information</h2>

      {error && (
        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-4 mb-6">
        <div>
          <label className="label">Full Name *</label>
          <input
            type="text"
            value={data.name}
            onChange={(e) => onUpdate('name', e.target.value)}
            className="input"
            placeholder="John Doe"
            required
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="label">Email *</label>
            <input
              type="email"
              value={data.email}
              onChange={(e) => onUpdate('email', e.target.value)}
              className="input"
              placeholder="john@example.com"
              required
            />
          </div>

          <div>
            <label className="label">Phone</label>
            <input
              type="tel"
              value={data.phone}
              onChange={(e) => onUpdate('phone', e.target.value)}
              className="input"
              placeholder="+1 (555) 123-4567"
            />
          </div>
        </div>

        <div>
          <label className="label">Location</label>
          <input
            type="text"
            value={data.location}
            onChange={(e) => onUpdate('location', e.target.value)}
            className="input"
            placeholder="San Francisco, CA"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="label">LinkedIn</label>
            <input
              type="text"
              value={data.linkedin}
              onChange={(e) => {
                onUpdate('linkedin', e.target.value);
                setUrlErrors(prev => ({ ...prev, linkedin: '' }));
              }}
              onBlur={(e) => handleUrlBlur(e.target.value, 'linkedin')}
              className={`input ${urlErrors.linkedin ? 'border-red-500' : ''}`}
              placeholder="linkedin.com/in/johndoe"
            />
            {urlErrors.linkedin && (
              <p className="text-red-600 text-xs mt-1">{urlErrors.linkedin}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Example: linkedin.com/in/yourname or https://linkedin.com/in/yourname
            </p>
          </div>

          <div>
            <label className="label">Website/Portfolio</label>
            <input
              type="text"
              value={data.website}
              onChange={(e) => {
                onUpdate('website', e.target.value);
                setUrlErrors(prev => ({ ...prev, website: '' }));
              }}
              onBlur={(e) => handleUrlBlur(e.target.value, 'website')}
              className={`input ${urlErrors.website ? 'border-red-500' : ''}`}
              placeholder="johndoe.com"
            />
            {urlErrors.website && (
              <p className="text-red-600 text-xs mt-1">{urlErrors.website}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Example: yourwebsite.com or https://yourwebsite.com
            </p>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="label mb-0">Professional Summary</label>
            <button
              onClick={handleGenerateSummary}
              disabled={generating}
              className="text-sm text-primary-600 hover:text-primary-700"
            >
              {generating ? '✨ Generating...' : '✨ Generate with AI'}
            </button>
          </div>
          <textarea
            value={summary}
            onChange={(e) => onUpdate('summary', e.target.value)}
            className="input min-h-[100px]"
            placeholder="A brief professional summary..."
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="label mb-0">Skills</label>
            <button
              onClick={handleGenerateSkills}
              disabled={generating}
              className="text-sm text-primary-600 hover:text-primary-700"
            >
              {generating ? '✨ Generating...' : '✨ Generate with AI'}
            </button>
          </div>
          <input
            type="text"
            value={skills.technical.join(', ')}
            onChange={(e) =>
              onUpdate('skills', {
                ...skills,
                technical: e.target.value.split(',').map((s) => s.trim()),
              })
            }
            className="input"
            placeholder="JavaScript, React, Node.js, Python..."
          />
          <p className="text-xs text-gray-500 mt-1">Separate skills with commas</p>
        </div>
      </div>

      <div className="flex gap-4">
        <button onClick={onBack} className="btn btn-secondary flex-1">
          Back
        </button>
        <button
          onClick={() => {
            if (urlErrors.linkedin || urlErrors.website) {
              setError('Please fix URL errors before continuing');
              return;
            }
            onNext();
          }}
          disabled={!data.name || !data.email || urlErrors.linkedin || urlErrors.website}
          className="btn btn-primary flex-1"
        >
          Continue
        </button>
      </div>
    </div>
  );
}

export default PersonalInfoForm;
