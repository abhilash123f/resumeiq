import { useState } from 'react';

function UploadForm({ onUpload, loading }) {
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (selectedFile) => {
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
    ];

    if (!allowedTypes.includes(selectedFile.type)) {
      alert('Please upload a PDF, DOCX, or TXT file');
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    setFile(selectedFile);
  };

  const handleSubmit = () => {
    if (file) {
      onUpload(file);
    }
  };

  return (
    <div>
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive
            ? 'border-primary-600 bg-primary-50'
            : 'border-gray-300 hover:border-primary-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="file-upload"
          className="hidden"
          accept=".pdf,.docx,.txt"
          onChange={handleChange}
          disabled={loading}
        />

        {!file ? (
          <>
            <div className="text-6xl mb-4">📄</div>
            <p className="text-lg mb-2">Drag and drop your resume here</p>
            <p className="text-gray-600 mb-4">or</p>
            <label
              htmlFor="file-upload"
              className="btn btn-primary cursor-pointer inline-block"
            >
              Browse Files
            </label>
            <p className="text-sm text-gray-500 mt-4">
              Supported formats: PDF, DOCX, TXT (max 10MB)
            </p>
            <p className="text-xs text-gray-400 mt-2 flex items-center justify-center gap-1">
              🔒 Files processed securely. Deleted after 30 days.
            </p>
          </>
        ) : (
          <>
            <div className="text-6xl mb-4">✓</div>
            <p className="text-lg font-semibold mb-2">{file.name}</p>
            <p className="text-gray-600 mb-4">
              {(file.size / 1024).toFixed(2)} KB
            </p>
            <div className="flex gap-4 justify-center">
              <label
                htmlFor="file-upload"
                className="btn btn-secondary cursor-pointer"
              >
                Change File
              </label>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="btn btn-primary"
              >
                {loading ? 'Uploading...' : 'Upload Resume'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default UploadForm;
