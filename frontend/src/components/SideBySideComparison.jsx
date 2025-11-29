import { useState, useEffect } from 'react';

function SideBySideComparison({ resumeText, jobDescription, matchedKeywords = [] }) {
  const [selectedKeyword, setSelectedKeyword] = useState(null);
  const [resumeHighlights, setResumeHighlights] = useState([]);
  const [jdHighlights, setJdHighlights] = useState([]);

  useEffect(() => {
    // Extract keywords from matched data
    if (matchedKeywords.length > 0) {
      findKeywordPositions();
    }
  }, [resumeText, jobDescription, matchedKeywords]);

  const findKeywordPositions = () => {
    const resumeMatches = [];
    const jdMatches = [];

    matchedKeywords.forEach(keyword => {
      const keywordLower = keyword.toLowerCase();
      const resumeLower = resumeText.toLowerCase();
      const jdLower = jobDescription.toLowerCase();

      // Find all occurrences in resume
      let resumeIndex = resumeLower.indexOf(keywordLower);
      while (resumeIndex !== -1) {
        resumeMatches.push({
          keyword,
          start: resumeIndex,
          end: resumeIndex + keyword.length,
        });
        resumeIndex = resumeLower.indexOf(keywordLower, resumeIndex + 1);
      }

      // Find all occurrences in job description
      let jdIndex = jdLower.indexOf(keywordLower);
      while (jdIndex !== -1) {
        jdMatches.push({
          keyword,
          start: jdIndex,
          end: jdIndex + keyword.length,
        });
        jdIndex = jdLower.indexOf(keywordLower, jdIndex + 1);
      }
    });

    setResumeHighlights(resumeMatches);
    setJdHighlights(jdMatches);
  };

  const highlightText = (text, highlights, side) => {
    if (!highlights || highlights.length === 0) {
      return <span>{text}</span>;
    }

    // Sort highlights by start position
    const sortedHighlights = [...highlights].sort((a, b) => a.start - b.start);
    const parts = [];
    let lastIndex = 0;

    sortedHighlights.forEach((highlight, idx) => {
      // Add text before highlight
      if (highlight.start > lastIndex) {
        parts.push(
          <span key={`text-${idx}`}>
            {text.substring(lastIndex, highlight.start)}
          </span>
        );
      }

      // Add highlighted text
      const isSelected = selectedKeyword === highlight.keyword;
      parts.push(
        <mark
          key={`highlight-${idx}`}
          className={`cursor-pointer transition-colors ${
            isSelected
              ? 'bg-yellow-300 font-semibold'
              : 'bg-yellow-100 hover:bg-yellow-200'
          }`}
          onClick={() => handleKeywordClick(highlight.keyword)}
        >
          {text.substring(highlight.start, highlight.end)}
        </mark>
      );

      lastIndex = highlight.end;
    });

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(
        <span key="text-end">{text.substring(lastIndex)}</span>
      );
    }

    return <>{parts}</>;
  };

  const handleKeywordClick = (keyword) => {
    setSelectedKeyword(selectedKeyword === keyword ? null : keyword);
  };

  return (
    <div className="card mb-8">
      <h3 className="text-lg font-semibold mb-4">Side-by-Side Comparison</h3>
      <p className="text-sm text-gray-600 mb-4">
        Click on highlighted keywords to see matches across both documents
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Resume Side */}
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <h4 className="font-semibold mb-3 text-primary-600">Your Resume</h4>
          <div className="text-sm text-gray-700 whitespace-pre-wrap max-h-96 overflow-y-auto">
            {highlightText(resumeText, resumeHighlights, 'resume')}
          </div>
        </div>

        {/* Job Description Side */}
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <h4 className="font-semibold mb-3 text-primary-600">Job Description</h4>
          <div className="text-sm text-gray-700 whitespace-pre-wrap max-h-96 overflow-y-auto">
            {highlightText(jobDescription, jdHighlights, 'jd')}
          </div>
        </div>
      </div>

      {selectedKeyword && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
          <p className="text-sm">
            <span className="font-semibold">Selected keyword:</span>{' '}
            <span className="text-blue-700">{selectedKeyword}</span>
          </p>
        </div>
      )}
    </div>
  );
}

export default SideBySideComparison;
