function TemplateSelector({ selected, onSelect, onNext }) {
  const templates = [
    {
      id: 'professional',
      name: 'Professional',
      description: 'Clean and traditional layout',
      preview: '📄',
    },
    {
      id: 'modern',
      name: 'Modern',
      description: 'Contemporary design with colors',
      preview: '🎨',
    },
    {
      id: 'minimal',
      name: 'Minimal',
      description: 'Simple and elegant',
      preview: '✨',
    },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Choose a Template</h2>
      <p className="text-gray-600 mb-6">
        Select a template that best fits your style
      </p>

      <div className="grid md:grid-cols-3 gap-4 mb-8">
        {templates.map((template) => (
          <div
            key={template.id}
            onClick={() => onSelect(template.id)}
            className={`p-6 border-2 rounded-lg cursor-pointer transition-all ${
              selected === template.id
                ? 'border-primary-600 bg-primary-50'
                : 'border-gray-200 hover:border-primary-300'
            }`}
          >
            <div className="text-5xl mb-3 text-center">{template.preview}</div>
            <h3 className="font-semibold text-lg mb-1">{template.name}</h3>
            <p className="text-sm text-gray-600">{template.description}</p>
          </div>
        ))}
      </div>

      <button onClick={onNext} className="btn btn-primary w-full">
        Continue
      </button>
    </div>
  );
}

export default TemplateSelector;
