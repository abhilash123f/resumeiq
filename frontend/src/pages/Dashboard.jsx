import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserMatches, getProfile, softDeleteMatch, bulkDeleteMatches, clearAllMatches } from '../api';

function Dashboard() {
  const [matches, setMatches] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMatches, setSelectedMatches] = useState(new Set());
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [profileRes, matchesRes] = await Promise.all([
        getProfile(),
        getProfile().then(res => getUserMatches(res.data.user._id))
      ]);

      setUser(profileRes.data.user);
      setMatches(matchesRes.data.matches);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handleSelectMatch = (matchId) => {
    const newSelected = new Set(selectedMatches);
    if (newSelected.has(matchId)) {
      newSelected.delete(matchId);
    } else {
      newSelected.add(matchId);
    }
    setSelectedMatches(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedMatches.size === matches.length) {
      setSelectedMatches(new Set());
    } else {
      setSelectedMatches(new Set(matches.map(m => m._id)));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedMatches.size === 0) return;

    try {
      await bulkDeleteMatches(Array.from(selectedMatches));
      setSelectedMatches(new Set());
      loadData(); // Reload data
    } catch (err) {
      console.error('Failed to delete matches:', err);
      alert('Failed to delete selected analyses');
    }
  };

  const handleDeleteSingle = async (matchId, e) => {
    e.stopPropagation();
    
    if (!confirm('Delete this analysis?')) return;

    try {
      await softDeleteMatch(matchId);
      loadData(); // Reload data
    } catch (err) {
      console.error('Failed to delete match:', err);
      alert('Failed to delete analysis');
    }
  };

  const handleClearAll = async () => {
    if (!confirm('Delete ALL analyses? This cannot be undone after 30 days.')) return;

    try {
      await clearAllMatches();
      setShowDeleteConfirm(false);
      loadData(); // Reload data
    } catch (err) {
      console.error('Failed to clear all matches:', err);
      alert('Failed to clear all analyses');
    }
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome back, {user?.name}!</p>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <button
          onClick={() => navigate('/resume-builder')}
          className="card hover:shadow-lg transition-shadow cursor-pointer text-left"
        >
          <div className="text-4xl mb-4">✨</div>
          <h3 className="text-xl font-semibold mb-2">AI Resume Builder</h3>
          <p className="text-gray-600">Build your resume with AI assistance</p>
        </button>

        <button
          onClick={() => navigate('/my-resumes')}
          className="card hover:shadow-lg transition-shadow cursor-pointer text-left"
        >
          <div className="text-4xl mb-4">📋</div>
          <h3 className="text-xl font-semibold mb-2">My Resumes</h3>
          <p className="text-gray-600">View and manage saved resumes</p>
        </button>

        <button
          onClick={() => navigate('/upload')}
          className="card hover:shadow-lg transition-shadow cursor-pointer text-left"
        >
          <div className="text-4xl mb-4">📄</div>
          <h3 className="text-xl font-semibold mb-2">Resume Analysis</h3>
          <p className="text-gray-600">Upload a resume and analyze match</p>
        </button>

        <div className="card">
          <div className="text-4xl mb-4">📊</div>
          <h3 className="text-xl font-semibold mb-2">Total Analyses</h3>
          <p className="text-3xl font-bold text-primary-600">{matches.length}</p>
        </div>

        <div className="card">
          <div className="text-4xl mb-4">⭐</div>
          <h3 className="text-xl font-semibold mb-2">Avg Score</h3>
          <p className="text-3xl font-bold text-primary-600">
            {matches.length > 0
              ? Math.round(matches.reduce((sum, m) => sum + m.score, 0) / matches.length)
              : 0}%
          </p>
        </div>
      </div>

      {/* Recent Matches */}
      <div className="card">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Recent Analyses</h2>
          
          {matches.length > 0 && (
            <div className="flex gap-2">
              {selectedMatches.size > 0 && (
                <>
                  <button
                    onClick={handleDeleteSelected}
                    className="btn btn-secondary text-sm"
                  >
                    Delete Selected ({selectedMatches.size})
                  </button>
                  <button
                    onClick={() => setSelectedMatches(new Set())}
                    className="btn btn-secondary text-sm"
                  >
                    Clear Selection
                  </button>
                </>
              )}
              <button
                onClick={handleSelectAll}
                className="btn btn-secondary text-sm"
              >
                {selectedMatches.size === matches.length ? 'Deselect All' : 'Select All'}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="btn btn-secondary text-sm text-red-600 hover:bg-red-50"
              >
                Clear All
              </button>
            </div>
          )}
        </div>

        {matches.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-gray-600 mb-4">No analyses yet</p>
            <button
              onClick={() => navigate('/upload')}
              className="btn btn-primary"
            >
              Create Your First Analysis
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {matches.map((match) => (
              <div
                key={match._id}
                className={`border rounded-lg p-4 hover:border-primary-600 hover:shadow-md transition-all cursor-pointer ${
                  selectedMatches.has(match._id) ? 'border-primary-600 bg-primary-50' : 'border-gray-200'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-start gap-3 flex-1">
                    <input
                      type="checkbox"
                      checked={selectedMatches.has(match._id)}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleSelectMatch(match._id);
                      }}
                      className="mt-1"
                    />
                    <div className="flex-1" onClick={() => navigate(`/results/${match._id}`)}>
                      <h3 className="font-semibold text-lg mb-1">
                        {match.resumeId?.fileName || 'Resume Analysis'}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {match.jobDescription.substring(0, 150)}...
                      </p>
                    </div>
                  </div>
                  <div className="ml-4 flex items-start gap-3">
                    <button
                      onClick={(e) => handleDeleteSingle(match._id, e)}
                      className="text-red-600 hover:text-red-800 text-sm px-2 py-1 hover:bg-red-50 rounded"
                      title="Delete"
                    >
                      🗑️
                    </button>
                    <div className="text-right">
                      <div className={`text-3xl font-bold ${getScoreColor(match.score)}`}>
                        {match.score}%
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(match.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 mt-3">
                  <div className="text-sm">
                    <span className="text-gray-600">Skills:</span>{' '}
                    <span className="font-semibold">{match.breakdown.skills}%</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-600">Experience:</span>{' '}
                    <span className="font-semibold">{match.breakdown.experience}%</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-600">Keywords:</span>{' '}
                    <span className="font-semibold">{match.breakdown.keywords}%</span>
                  </div>
                </div>

                {match.missingSkills.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {match.missingSkills.slice(0, 3).map((skill, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs"
                      >
                        {skill}
                      </span>
                    ))}
                    {match.missingSkills.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                        +{match.missingSkills.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Clear All Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">Clear All Analyses?</h3>
            <p className="text-gray-600 mb-6">
              This will delete all {matches.length} analyses. They will be recoverable for 30 days, after which they will be permanently deleted.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="btn btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handleClearAll}
                className="btn btn-primary flex-1 bg-red-600 hover:bg-red-700"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
