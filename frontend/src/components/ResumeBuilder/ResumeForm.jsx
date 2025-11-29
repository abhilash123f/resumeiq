import { useState } from 'react';
import PersonalInfoForm from './PersonalInfoForm';
import ExperienceForm from './ExperienceForm';
import ReviewForm from './ReviewForm';

function ResumeForm({ step, resumeData, updateResumeData, onNext, onBack }) {
  return (
    <div>
      {step === 2 && (
        <PersonalInfoForm
          data={resumeData.personalInfo}
          summary={resumeData.summary}
          skills={resumeData.skills}
          onUpdate={(field, value) => {
            if (field === 'summary') {
              updateResumeData('summary', value);
            } else if (field === 'skills') {
              updateResumeData('skills', value);
            } else {
              updateResumeData('personalInfo', {
                ...resumeData.personalInfo,
                [field]: value,
              });
            }
          }}
          onNext={onNext}
          onBack={onBack}
        />
      )}

      {step === 3 && (
        <ExperienceForm
          experience={resumeData.experience}
          education={resumeData.education}
          projects={resumeData.projects}
          onUpdate={(section, value) => updateResumeData(section, value)}
          onNext={onNext}
          onBack={onBack}
        />
      )}

      {step === 4 && (
        <ReviewForm
          resumeData={resumeData}
          onBack={onBack}
        />
      )}
    </div>
  );
}

export default ResumeForm;
