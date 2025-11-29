function ScoreCard({ match }) {
  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return 'Excellent Match';
    if (score >= 60) return 'Good Match';
    if (score >= 40) return 'Fair Match';
    return 'Needs Improvement';
  };

  return (
    <div className="card mb-8 text-center">
      <h2 className="text-2xl font-semibold mb-4">Overall Match Score</h2>
      <div className={`text-7xl font-bold mb-2 ${getScoreColor(match.score)}`}>
        {match.score}%
      </div>
      <p className="text-xl text-gray-600 mb-4">{getScoreLabel(match.score)}</p>
      
      <div className="max-w-md mx-auto">
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div
            className={`h-4 rounded-full transition-all ${
              match.score >= 80
                ? 'bg-green-600'
                : match.score >= 60
                ? 'bg-yellow-600'
                : 'bg-red-600'
            }`}
            style={{ width: `${match.score}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}

export default ScoreCard;
