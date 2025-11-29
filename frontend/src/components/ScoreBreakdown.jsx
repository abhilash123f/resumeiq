function ScoreBreakdown({ breakdown, overallScore }) {
  // Default weights
  const weights = {
    skills: 0.4,
    experience: 0.2,
    keywords: 0.3,
    ats: 0.1,
  };

  const atsScore = 100; // Placeholder - will be calculated from passesATS

  return (
    <div className="card mb-8">
      <h3 className="text-lg font-semibold mb-4">Score Calculation</h3>
      <p className="text-sm text-gray-600 mb-4">
        Your overall score is calculated using weighted components:
      </p>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Skills Match</span>
            <span className="text-xs text-gray-500">({breakdown.skills}%)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">× {weights.skills}</span>
            <span className="text-sm font-semibold text-primary-600">
              = {(breakdown.skills * weights.skills).toFixed(1)}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Experience Match</span>
            <span className="text-xs text-gray-500">({breakdown.experience}%)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">× {weights.experience}</span>
            <span className="text-sm font-semibold text-primary-600">
              = {(breakdown.experience * weights.experience).toFixed(1)}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Keywords Match</span>
            <span className="text-xs text-gray-500">({breakdown.keywords}%)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">× {weights.keywords}</span>
            <span className="text-sm font-semibold text-primary-600">
              = {(breakdown.keywords * weights.keywords).toFixed(1)}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">ATS Compatibility</span>
            <span className="text-xs text-gray-500">(100%)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">× {weights.ats}</span>
            <span className="text-sm font-semibold text-primary-600">
              = {(atsScore * weights.ats).toFixed(1)}
            </span>
          </div>
        </div>

        <div className="border-t pt-3 mt-3">
          <div className="flex items-center justify-between">
            <span className="font-semibold">Overall Score</span>
            <span className="text-xl font-bold text-primary-600">
              {overallScore}%
            </span>
          </div>
        </div>
      </div>

      <p className="text-xs text-gray-500 mt-4">
        Formula: (Skills × 0.4) + (Experience × 0.2) + (Keywords × 0.3) + (ATS × 0.1)
      </p>
    </div>
  );
}

export default ScoreBreakdown;
