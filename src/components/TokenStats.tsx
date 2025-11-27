import React from 'react';

interface TokenStatsProps {
  jsonTokens: number;
  toonTokens: number;
  savedPercentage: number;
}

export const TokenStats: React.FC<TokenStatsProps> = ({ jsonTokens, toonTokens, savedPercentage }) => {
  return (
    <div className="token-stats">
      <div className="stat-item">
        <span className="stat-label">JSON Tokens</span>
        <span className="stat-value">{jsonTokens}</span>
      </div>
      <div className="stat-item">
        <span className="stat-label">TOON Tokens</span>
        <span className="stat-value">{toonTokens}</span>
      </div>
      <div className="stat-item">
        <span className="stat-label">Saved</span>
        <span className="stat-value">{savedPercentage.toFixed(1)}%</span>
      </div>
    </div>
  );
};
