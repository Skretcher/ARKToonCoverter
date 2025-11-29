// src/components/HFTDisplay.tsx
import React, { useState } from 'react';
import { HFTNode, HFTChildNode } from '../utils/types';
import { convertToonToHFT } from '../utils/hftConverter';

interface HFTDisplayProps {
  toonInput: string;
  isFullscreen?: boolean;
}

interface HFTNodeProps {
  node: HFTNode;
  depth: number;
}

/* ===============================
   Recursive HFT Node Renderer
================================= */
const HFTNodeComponent: React.FC<HFTNodeProps> = ({ node, depth }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const toggleExpand = () => {
    if (node.kind === 'root' || node.kind === 'object' || node.kind === 'array') {
      setIsExpanded(!isExpanded);
    }
  };

  const indentStyle: React.CSSProperties = {
    marginLeft: `${Math.min(depth * 16, 200)}px`
  };

  const renderChildren = () => {
    if (!isExpanded) return null;

    const children =
      node.kind === 'root' || node.kind === 'object' || node.kind === 'array'
        ? node.children ?? []
        : [];

    return children.map((child, index) => (
      <HFTChildComponent
        key={child.kind === 'keyValue' ? child.key ?? index : index}
        child={child}
        depth={depth + 1}
      />
    ));
  };

  const label =
    'label' in node && node.label
      ? node.label
      : node.kind === 'root'
      ? 'Root'
      : node.kind === 'object'
      ? 'Object'
      : node.kind === 'array'
      ? 'Array'
      : '';

  return (
    <div className="hft-node" style={indentStyle}>
      <div className="hft-header" onClick={toggleExpand} role="button" tabIndex={0}>
        <span className="hft-icon">{node.icon}</span>
        <span className="hft-label">{label}</span>
        {(node.kind === 'root' || node.kind === 'object' || node.kind === 'array') && (
          <span className="hft-toggle">{isExpanded ? '▼' : '▶'}</span>
        )}
      </div>
      {renderChildren()}
    </div>
  );
};

/* ===============================
   Child Renderer (keyValue / arrayItem)
================================= */
const HFTChildComponent: React.FC<{ child: HFTChildNode; depth: number }> = ({
  child,
  depth
}) => {
  const indentStyle: React.CSSProperties = {
    marginLeft: `${Math.min(depth * 16, 200)}px`
  };

  if (child.kind === 'keyValue') {
    return (
      <div className="hft-node hft-key-value" style={indentStyle}>
        <div className="hft-header">
          <span className="hft-icon">{child.icon}</span>
          <span className="hft-key">{child.key}:</span>
          <span className="hft-arrow">→</span>
        </div>
        <HFTNodeComponent node={child.child} depth={depth + 1} />
      </div>
    );
  }

  if (child.kind === 'arrayItem') {
    return (
      <div className="hft-node hft-array-item" style={indentStyle}>
        <div className="hft-header">
          <span className="hft-icon">{child.icon}</span>
        </div>
        <HFTNodeComponent node={child.child} depth={depth + 1} />
      </div>
    );
  }

  return null;
};

/* ===============================
   Main HFT Display
================================= */
export const HFTDisplay: React.FC<HFTDisplayProps> = ({ toonInput, isFullscreen = false }) => {
  const [hftTree, setHftTree] = useState<HFTNode | null>(null);
  const [error, setError] = useState<string>('');

  React.useEffect(() => {
    if (toonInput.trim()) {
      const result = convertToonToHFT(toonInput);
      if (result.success) {
        setHftTree(result.data || null);
        setError('');
      } else {
        setHftTree(null);
        setError(result.error || 'HFT conversion failed');
      }
    } else {
      setHftTree(null);
      setError('');
    }
  }, [toonInput]);

  if (error) {
    return (
      <div className="hft-display error">
        <div className="hft-error">Error: {error}</div>
      </div>
    );
  }

  if (!hftTree) {
    return (
      <div className="hft-display">
        <div className="hft-placeholder">No TOON data to display. Convert JSON first.</div>
      </div>
    );
  }

  return (
    <div className={`hft-display ${isFullscreen ? 'fullscreen' : ''}`}>
      <div className="hft-title">
        Human-Friendly Toon View
      </div>

      <div className="hft-tree-wrapper">
        <div className="hft-tree">
          <HFTNodeComponent node={hftTree} depth={0} />
        </div>
      </div>
    </div>
  );
};
