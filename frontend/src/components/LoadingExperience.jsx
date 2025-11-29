import { useState, useEffect } from 'react';

function LoadingExperience({ progress = 0 }) {
  const [currentTip, setCurrentTip] = useState(0);
  const [currentStatus, setCurrentStatus] = useState(0);

  const statusMessages = [
    'Analyzing your skills...',
    'Matching experience levels...',
    'Checking ATS compatibility...',
    'Identifying keywords...',
    'Generating tailored suggestions...',
    'Calculating match score...',
    'Finalizing results...',
  ];

  const tips = [
    '💡 Tip: Use action verbs like "led", "developed", "achieved" in your resume',
    '💡 Tip: Quantify your achievements with numbers and percentages',
    '💡 Tip: Tailor your resume keywords to match the job description',
    '💡 Tip: Keep your resume format simple for better ATS compatibility',
    '💡 Tip: Include relevant skills from the job posting in your resume',
    '💡 Tip: Use industry-specific terminology to show expertise',
  ];

  useEffect(() => {
    // Rotate status messages every 2 seconds
    const statusInterval = setInterval(() => {
      setCurrentStatus((prev) => (prev + 1) % statusMessages.length);
    }, 2000);

    return () => clearInterval(statusInterval);
  }, []);

  useEffect(() => {
    // Rotate tips every 5 seconds
    const tipInterval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % tips.length);
    }, 5000);

    return () => clearInterval(tipInterval);
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="card text-center">
        {/* Animated Icon */}
        <div className="mb-6">
          <div className="inline-block animate-spin text-6xl">
            ⚙️
          </div>
        </div>

        {/* Status Message */}
        <h2 className="text-2xl font-bold mb-2">Analyzing Your Resume</h2>
        <p className="text-lg text-primary-600 mb-6 min-h-[28px] transition-opacity duration-300">
          {statusMessages[currentStatus]}
        </p>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
            <div
              className="bg-primary-600 h-4 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            >
              <div className="h-full w-full bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse"></div>
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-2">{progress}% Complete</p>
        </div>

        {/* Rotating Tips */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <p className="text-sm text-gray-700 min-h-[40px] transition-opacity duration-300">
            {tips[currentTip]}
          </p>
        </div>

        {/* Processing Steps */}
        <div className="text-left space-y-2 mt-6">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-green-600">✓</span>
            <span className="text-gray-600">Resume uploaded successfully</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-green-600">✓</span>
            <span className="text-gray-600">Text extracted and parsed</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            {progress >= 50 ? (
              <span className="text-green-600">✓</span>
            ) : (
              <div className="w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
            )}
            <span className={progress >= 50 ? 'text-gray-600' : 'text-primary-600 font-medium'}>
              AI analysis in progress
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            {progress >= 100 ? (
              <span className="text-green-600">✓</span>
            ) : (
              <span className="text-gray-400">○</span>
            )}
            <span className="text-gray-400">Generating results</span>
          </div>
        </div>

        {/* Estimated Time */}
        <p className="text-xs text-gray-500 mt-6">
          This usually takes 10-30 seconds depending on resume length
        </p>
      </div>
    </div>
  );
}

export default LoadingExperience;
