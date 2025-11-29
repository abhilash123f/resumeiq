import { useState } from 'react';

function SnippetList({ original, tailored, onAccept }) {
  const [acceptedBullets, setAcceptedBullets] = useState(new Set());

  const handleAccept = (index) => {
    setAcceptedBullets(prev => new Set([...prev, index]));
    if (onAccept) {
      onAccept(index, tailored[index]);
    }
  };

  return (
    <div className="space-y-6">
      {tailored.map((tailoredBullet, index) => (
        <div key={index} className="border-l-4 border-primary-600 pl-4">
          {original[index] && (
            <div className="mb-3">
              <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                Original
              </p>
              <p className="text-gray-600 italic">{original[index]}</p>
            </div>
          )}
          
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <p className="text-xs font-semibold text-primary-600 uppercase mb-1">
                AI-Tailored
              </p>
              <p className="text-gray-900 font-medium">{tailoredBullet}</p>
            </div>
            
            {onAccept && (
              <button
                onClick={() => handleAccept(index)}
                disabled={acceptedBullets.has(index)}
                className={`px-3 py-1 text-sm rounded transition-colors ${
                  acceptedBullets.has(index)
                    ? 'bg-green-100 text-green-700 cursor-not-allowed'
                    : 'bg-primary-600 text-white hover:bg-primary-700'
                }`}
              >
                {acceptedBullets.has(index) ? '✓ Accepted' : 'Accept'}
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default SnippetList;
