import React from 'react';

interface ErrorDisplayProps {
  error?: string;
  type?: 'error' | 'warning' | 'info';
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  type = 'error'
}) => {
  if (!error) return null;

  return (
    <div className={`error-display ${type}`}>
      <div className="error-icon">
        {type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️'}
      </div>
      <div className="error-content">
        {error}
      </div>
    </div>
  );
};
