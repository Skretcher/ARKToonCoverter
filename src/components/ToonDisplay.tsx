import React from 'react';

interface ToonDisplayProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  readOnly?: boolean;
}

export const ToonDisplay: React.FC<ToonDisplayProps> = ({
  value,
  onChange,
  placeholder = 'TOON output will appear here...',
  error,
  readOnly = false
}) => {
  return (
    <div className="toon-display">
      <label className="editor-label">TOON Output</label>
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
