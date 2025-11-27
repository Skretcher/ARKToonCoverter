import React, { useState, useCallback, useMemo } from 'react';
import { convertJsonToToon } from '../utils/jsonToToonConverter';
import { convertToonToJson } from '../utils/toonToJsonConverter';
import { validateJson, validateToon } from '../utils/validators';
import { JsonEditor } from './JsonEditor';
import { ToonDisplay } from './ToonDisplay';
import { ErrorDisplay } from './ErrorDisplay';
import { TokenStats } from './TokenStats';

export const JsonToonConverter: React.FC = () => {
  const [jsonInput, setJsonInput] = useState<string>('{\n  "name": "example",\n  "age": 30,\n  "active": true\n}');
  const [toonInput, setToonInput] = useState<string>('');
  const [jsonError, setJsonError] = useState<string>('');
  const [toonError, setToonError] = useState<string>('');
  const [conversionDirection, setConversionDirection] = useState<'jsonToToon' | 'toonToJson'>('jsonToToon');

  // Convert JSON to TOON
  const handleConvertJsonToToon = () => {
    const validation = validateJson(jsonInput);
    if (!validation.isValid) {
      setJsonError(validation.error || 'Invalid JSON');
      setToonInput('');
      setToonError('');
      return;
    }

    setJsonError('');
    const result = convertJsonToToon(jsonInput);
    
    if (result.success) {
      setToonInput(result.data);
      setToonError('');
    } else {
      setToonError(result.error || 'Conversion failed');
    }
  };

  // Convert TOON to JSON
  const handleConvertToonToJson = () => {
    const validation = validateToon(toonInput);
    if (!validation.isValid) {
      setToonError(validation.error || 'Invalid TOON format');
      setJsonInput('');
      setJsonError('');
      return;
    }

    setToonError('');
    const result = convertToonToJson(toonInput);
    
    if (result.success) {
      setJsonInput(result.data);
      setJsonError('');
    } else {
      setJsonError(result.error || 'Conversion failed');
    }
  };

  const toggleDirection = useCallback(() => {
    setConversionDirection(prev => 
      prev === 'jsonToToon' ? 'toonToJson' : 'jsonToToon'
    );
  }, []);

  const directionLabel = useMemo(() => 
    conversionDirection === 'jsonToToon' ? 'JSON → TOON' : 'TOON → JSON',
    [conversionDirection]
  );

  const countJsonTokens = (json: string) => {
    try {
      const parsed = JSON.parse(json);
      let count = 0;
  
      const walk = (value: any) => {
        if (Array.isArray(value)) {
          count++; // array start
          value.forEach(walk);
          count++; // array end
        } else if (value !== null && typeof value === "object") {
          count++; // object start
          Object.entries(value).forEach(([key, val]) => {
            count++; // key token
            walk(val);
          });
          count++; // object end
        } else {
          count++; // value token (num/str/bool/null)
        }
      };
  
      walk(parsed);
      return count;
  
    } catch {
      return 0;
    }
  };
  
  const countToonTokens = (toon: string) =>
    toon.trim().split(/\r?\n/).filter(Boolean).length;

  const isJsonReadOnly = conversionDirection === 'toonToJson';
  const isToonReadOnly = conversionDirection === 'jsonToToon';

  const jsonTokens = useMemo(() => countJsonTokens(jsonInput), [jsonInput]);
  const toonTokens = useMemo(() => countToonTokens(toonInput), [toonInput]);
  const savedPercentage = useMemo(() => {
    if (jsonTokens === 0) return 0;
    return ((jsonTokens - toonTokens) / jsonTokens) * 100;
  }, [jsonTokens, toonTokens]);

  return (
    <div className="converter-container">
      <div className="converter-header">
        <h1>JSON ↔ TOON Converter</h1>
        <button 
          onClick={toggleDirection}
          className="direction-toggle"
        >
          Switch to {isToonReadOnly ? 'TOON → JSON' : 'JSON → TOON'}
        </button>
      </div>

      <div className="converter-content">
        <div className="input-section">
          <JsonEditor
            value={jsonInput}
            onChange={setJsonInput}
            error={jsonError}
            readOnly={isJsonReadOnly}
          />
        </div>

        <div className="output-section">
          <ToonDisplay
            value={toonInput}
            onChange={setToonInput}
            error={toonError}
            readOnly={isToonReadOnly}
          />
        </div>
      </div>

      <div className="converter-actions">
        <button 
          onClick={conversionDirection === 'jsonToToon' ? handleConvertJsonToToon : handleConvertToonToJson}
          className="convert-button"
        >
          Convert {directionLabel}
        </button>
      </div>

      <TokenStats 
        jsonTokens={jsonTokens}
        toonTokens={toonTokens}
        savedPercentage={savedPercentage}
      />

      {(jsonError || toonError) && (
        <ErrorDisplay 
          error={jsonError || toonError} 
          type={jsonError ? 'error' : 'warning'}
        />
      )}
    </div>
  );
};
