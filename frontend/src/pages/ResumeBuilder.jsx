import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ResumeForm from '../components/ResumeBuilder/ResumeForm';
import ResumePreview from '../components/ResumeBuilder/ResumePreview';
import TemplateSelector from '../components/ResumeBuilder/TemplateSelector';

function ResumeBuilder() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [template, setTemplate] = useState('professional');
  const [resumeData, setResumeData] = useState({
    personalInfo: {
      name: '',
      email: '',
      phone: '',
      location: '',
      linkedin: '',
      website: '',
    },
    summary: '',
    experience: [],
    education: [],
    skills: { technical: [], soft: [] },
    projects: [],
  });

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  const updateResumeData = (section, data) => {
    setResumeData(prev => ({
      ...prev,
      [section]: data,
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">AI Resume Builder</h1>
            <p className="text-gray-600">
              Build your professional resume with AI assistance
            </p>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="btn btn-secondary"
          >
            Back to Dashboard
          </button>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    step >= s
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-300 text-gray-600'
                  }`}
                >
                  {s}
                </div>
                {s < 4 && (
                  <div
                    className={`w-24 h-1 ${
                      step > s ? 'bg-primary-600' : 'bg-gray-300'
                    }`}
                  ></div>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-2 text-sm text-gray-600">
            <span className="w-32 text-center">Template</span>
            <span className="w-32 text-center">Personal Info</span>
            <span className="w-32 text-center">Experience</span>
            <span className="w-32 text-center">Review</span>
          </div>
        </div>

        {/* Content */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <div className="card">
            {step === 1 && (
              <TemplateSelector
                selected={template}
                onSelect={setTemplate}
                onNext={handleNext}
              />
            )}

            {step > 1 && (
              <ResumeForm
                step={step}
                resumeData={resumeData}
                updateResumeData={updateResumeData}
                onNext={handleNext}
                onBack={handleBack}
              />
            )}
          </div>

          {/* Preview Section */}
          <div className="sticky top-8 h-fit">
            <ResumePreview
              template={template}
              resumeData={resumeData}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResumeBuilder;
