import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UploadForm from '../components/UploadForm';
import { uploadResume, createMatch } from '../api';
import LoadingExperience from '../components/LoadingExperience';

function Upload() {
  const [step, setStep] = useState(1);
  const [resumeId, setResumeId] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false); // Track analysis state separately
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleResumeUpload = async (file) => {
    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('resume', file);

      const response = await uploadResume(formData);
      setResumeId(response.data.resume.id);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to upload resume');
    } finally {
      setLoading(false);
    }
  };

  const handleMatch = async () => {
    if (!jobDescription.trim() || jobDescription.length < 50) {
      setError('Job description must be at least 50 characters');
      return;
    }

    setLoading(true);
    setAnalyzing(true);
    setAnalysisProgress(0);
    setError('');

    // Simulate progress while waiting for API
    const progressInterval = setInterval(() => {
      setAnalysisProgress((prev) => {
        if (prev >= 90) return prev; // Cap at 90% until API responds
        return prev + 10;
      });
    }, 1000);

    try {
      const response = await createMatch({
        resumeId,
        jobDescription,
        fast: true, // Opt-in to fast mode
      });

      // Complete progress
      setAnalysisProgress(100);
      clearInterval(progressInterval);

      // Small delay to show 100% before navigating
      setTimeout(() => {
        navigate(`/results/${response.data.match.id}`);
      }, 500);
    } catch (err) {
      clearInterval(progressInterval);
      setAnalyzing(false);
      
      const errorMsg = err.response?.data?.error || 'Failed to create match';
      
      // User-friendly message for rate limits
      if (errorMsg.includes('rate limit')) {
        setError('AI service is busy. Please wait 10 seconds and try again.');
      } else {
        setError(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  // Show loading experience during analysis
  if (analyzing) {
    return <LoadingExperience progress={analysisProgress} />;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Analyze Resume</h1>
        <p className="text-gray-600">
          Upload your resume and paste a job description to get AI-powered matching analysis
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
            step >= 1 ? 'bg-primary-600 text-white' : 'bg-gray-300 text-gray-600'
          }`}>
            1
          </div>
          <div className={`w-24 h-1 ${step >= 2 ? 'bg-primary-600' : 'bg-gray-300'}`}></div>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
            step >= 2 ? 'bg-primary-600 text-white' : 'bg-gray-300 text-gray-600'
          }`}>
            2
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {step === 1 && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Step 1: Upload Resume</h2>
          <p className="text-gray-600 mb-6">
            Upload your resume in PDF, DOCX, or TXT format (max 10MB)
          </p>
          <UploadForm onUpload={handleResumeUpload} loading={loading} />
        </div>
      )}

      {step === 2 && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Step 2: Job Description</h2>
          <p className="text-gray-600 mb-6">
            Paste the job description you want to match against
          </p>

          <div className="mb-6">
            <label className="label">Job Description</label>
            <textarea
              value={jobDescription}
              onChange={(e) => {
                setJobDescription(e.target.value);
                setError('');
              }}
              className="input min-h-[300px] resize-y"
              placeholder="Paste the full job description here..."
            />
            <p className="text-sm text-gray-500 mt-2">
              {jobDescription.length} characters (minimum 50 required)
            </p>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setStep(1)}
              className="btn btn-secondary"
              disabled={loading}
            >
              Back
            </button>
            <button
              onClick={handleMatch}
              disabled={loading || jobDescription.length < 50}
              className="btn btn-primary flex-1"
            >
              {loading ? 'Analyzing...' : 'Analyze Match'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Upload;
