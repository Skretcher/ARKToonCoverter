import React, { useState } from 'react';

interface JsonEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  readOnly?: boolean;
}

export const JsonEditor: React.FC<JsonEditorProps> = ({
  value,
  onChange,
  placeholder = 'Enter JSON here...',
  error,
  readOnly = false
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="json-editor">
      <div className="editor-header">
        <label className="editor-label">JSON Input</label>
        <button onClick={handleCopy} className="copy-button">
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        readOnly={readOnly}
        className={`editor-textarea ${error ? 'error' : ''} ${readOnly ? 'read-only' : ''}`}
        rows={15}
      />
      {error && <div className="error-message">{error}</div>}
    </div>
  );
};
