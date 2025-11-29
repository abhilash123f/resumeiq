import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMatch, submitFeedback } from '../api';
import ScoreCard from '../components/ScoreCard';
import ScoreBreakdown from '../components/ScoreBreakdown';
import SnippetList from '../components/SnippetList';
import EditResumeModal from '../components/EditResumeModal';
import SideBySideComparison from '../components/SideBySideComparison';
import LoadingExperience from '../components/LoadingExperience';
import useJobStatus from '../hooks/useJobStatus';

function Results() {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [feedback, setFeedback] = useState({ rating: 0, comment: '' });
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  // Use job status polling hook for better loading experience
  const { progress } = useJobStatus(matchId);

  useEffect(() => {
    loadMatch();
  }, [matchId]);

  const loadMatch = async () => {
    try {
      const response = await getMatch(matchId);
      setMatch(response.data.match);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load match');
    } finally {
      setLoading(false);
    }
  };

  const handleFeedback = async (rating) => {
    try {
      await submitFeedback({ matchId, rating });
      setFeedbackSubmitted(true);
    } catch (err) {
      console.error('Failed to submit feedback:', err);
    }
  };

  const handleAcceptBullet = async (index, bullet) => {
    console.log(`Accepted bullet ${index}:`, bullet);
    // TODO: Add API call to save accepted bullet to resume draft
    // For now, just log it - backend endpoint would need to be created
  };

  if (loading) {
    return <LoadingExperience progress={progress} />;
  }

  if (error || !match) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg">
          {error || 'Match not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Match Results</h1>
          <p className="text-gray-600">
            Analysis completed on {new Date(match.createdAt).toLocaleDateString()}
          </p>
        </div>
        <button
          onClick={() => navigate('/dashboard')}
          className="btn btn-secondary"
        >
          Back to Dashboard
        </button>
      </div>

      {/* Overall Score */}
      <ScoreCard match={match} />

      {/* Score Breakdown with Weights */}
      <ScoreBreakdown breakdown={match.breakdown} overallScore={match.score} />

      {/* Breakdown Scores */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <h3 className="text-lg font-semibold mb-2">Skills Match</h3>
          <div className="text-4xl font-bold text-primary-600 mb-2">
            {match.breakdown.skills}%
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary-600 h-2 rounded-full"
              style={{ width: `${match.breakdown.skills}%` }}
            ></div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-2">Experience Match</h3>
          <div className="text-4xl font-bold text-primary-600 mb-2">
            {match.breakdown.experience}%
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary-600 h-2 rounded-full"
              style={{ width: `${match.breakdown.experience}%` }}
            ></div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-2">Keywords Match</h3>
          <div className="text-4xl font-bold text-primary-600 mb-2">
            {match.breakdown.keywords}%
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary-600 h-2 rounded-full"
              style={{ width: `${match.breakdown.keywords}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Explanation */}
      <div className="card mb-8">
        <h2 className="text-xl font-semibold mb-4">Analysis Summary</h2>
        <p className="text-gray-700">{match.explanation}</p>
      </div>

      {/* Side-by-Side Comparison */}
      {match.resumeId?.text && match.jobDescription && (
        <SideBySideComparison
          resumeText={match.resumeId.text}
          jobDescription={match.jobDescription}
          matchedKeywords={match.missingSkills || []}
        />
      )}

      {/* Strengths and Weaknesses */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="card">
          <h3 className="text-lg font-semibold mb-4 text-green-600">Strengths</h3>
          <ul className="space-y-2">
            {match.strengths.map((strength, index) => (
              <li key={index} className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                <span>{strength}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-4 text-orange-600">Areas for Improvement</h3>
          <ul className="space-y-2">
            {match.weaknesses.map((weakness, index) => (
              <li key={index} className="flex items-start">
                <span className="text-orange-600 mr-2">!</span>
                <span>{weakness}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Missing Skills */}
      {match.missingSkills.length > 0 && (
        <div className="card mb-8">
          <h3 className="text-lg font-semibold mb-4">Missing Skills</h3>
          <div className="flex flex-wrap gap-2">
            {match.missingSkills.map((skill, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Tailored Bullets */}
      {match.tailoredBullets.length > 0 && (
        <div className="card mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">AI-Tailored Resume Bullets</h3>
            <button
              onClick={() => setShowEditModal(true)}
              className="btn btn-primary"
            >
              Edit & Download
            </button>
          </div>
          <SnippetList
            original={match.originalBullets}
            tailored={match.tailoredBullets}
            onAccept={handleAcceptBullet}
          />
        </div>
      )}

      {/* ATS Check */}
      <div className="card mb-8">
        <h3 className="text-lg font-semibold mb-4">ATS Compatibility</h3>
        <div className={`px-4 py-3 rounded-lg mb-4 ${
          match.passesATS ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          {match.passesATS ? '✓ Resume is ATS-friendly' : '✗ Resume may have ATS issues'}
        </div>

        {match.atsWarnings.length > 0 && (
          <div className="mb-4">
            <h4 className="font-semibold mb-2">Issues:</h4>
            <ul className="space-y-1">
              {match.atsWarnings.map((warning, index) => (
                <li key={index} className="text-sm text-gray-700">• {warning}</li>
              ))}
            </ul>
          </div>
        )}

        {match.atsRecommendations.length > 0 && (
          <div>
            <h4 className="font-semibold mb-2">Recommendations:</h4>
            <ul className="space-y-1">
              {match.atsRecommendations.map((rec, index) => (
                <li key={index} className="text-sm text-gray-700">• {rec}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Feedback */}
      {!feedbackSubmitted && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Was this analysis helpful?</h3>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                onClick={() => handleFeedback(rating)}
                className="text-2xl hover:scale-110 transition-transform"
              >
                {rating <= feedback.rating ? '⭐' : '☆'}
              </button>
            ))}
          </div>
        </div>
      )}

      {feedbackSubmitted && (
        <div className="card bg-green-50 text-green-700">
          Thank you for your feedback!
        </div>
      )}

      {showEditModal && (
        <EditResumeModal
          match={match}
          onClose={() => setShowEditModal(false)}
        />
      )}
    </div>
  );
}

export default Results;
