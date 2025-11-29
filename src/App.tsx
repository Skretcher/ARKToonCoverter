import React from 'react';
import { ConverterPage } from './pages/ConverterPage';
import './App.css';
import './hft-styles.css';

export const App: React.FC = () => {
  return (
    <div className="app">
      <ConverterPage />
    </div>
  );
};

export default App;
