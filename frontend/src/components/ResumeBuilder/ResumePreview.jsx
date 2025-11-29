function ResumePreview({ template, resumeData }) {
  const { personalInfo, summary, experience, skills } = resumeData;

  return (
    <div className="card bg-white shadow-lg">
      <h3 className="text-lg font-semibold mb-4">Live Preview</h3>

      <div className="border-2 border-gray-200 rounded-lg p-6 bg-white min-h-[600px]">
        {/* Header */}
        <div className="text-center mb-6 pb-4 border-b-2 border-gray-300">
          <h1 className="text-2xl font-bold mb-2">
            {personalInfo.name || 'Your Name'}
          </h1>
          <div className="text-sm text-gray-600 space-x-2">
            {personalInfo.email && <span>{personalInfo.email}</span>}
            {personalInfo.phone && <span>• {personalInfo.phone}</span>}
            {personalInfo.location && <span>• {personalInfo.location}</span>}
          </div>
          {(personalInfo.linkedin || personalInfo.website) && (
            <div className="text-sm text-primary-600 mt-1">
              {personalInfo.linkedin && <span>{personalInfo.linkedin}</span>}
              {personalInfo.website && <span> • {personalInfo.website}</span>}
            </div>
          )}
        </div>

        {/* Summary */}
        {summary && (
          <div className="mb-6">
            <h2 className="text-lg font-bold mb-2 text-gray-800">PROFESSIONAL SUMMARY</h2>
            <p className="text-sm text-gray-700">{summary}</p>
          </div>
        )}

        {/* Skills */}
        {skills.technical.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-bold mb-2 text-gray-800">SKILLS</h2>
            <p className="text-sm text-gray-700">{skills.technical.join(' • ')}</p>
          </div>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-bold mb-2 text-gray-800">EXPERIENCE</h2>
            {experience.map((exp, i) => (
              <div key={i} className="mb-4">
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <h3 className="font-semibold text-sm">{exp.role}</h3>
                    <p className="text-sm text-gray-600">{exp.company}</p>
                  </div>
                  {exp.startDate && (
                    <span className="text-xs text-gray-500">
                      {exp.startDate} - {exp.endDate || 'Present'}
                    </span>
                  )}
                </div>
                {exp.bullets.length > 0 && (
                  <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                    {exp.bullets.map((bullet, j) => (
                      <li key={j}>{bullet}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}

        {!personalInfo.name && !summary && experience.length === 0 && (
          <div className="text-center text-gray-400 py-12">
            <p className="text-lg">Your resume preview will appear here</p>
            <p className="text-sm mt-2">Fill in the form to see live updates</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ResumePreview;
