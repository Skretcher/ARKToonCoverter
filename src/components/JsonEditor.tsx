import React from 'react';

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
  return (
    <div className="json-editor">
      <label className="editor-label">JSON Input</label>
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
