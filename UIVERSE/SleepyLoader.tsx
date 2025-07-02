import React from 'react';
import './SleepyLoader.css';

interface SleepyLoaderProps {
  letter?: string;
  loadingText?: string;
  count?: number;
}

const SleepyLoader: React.FC<SleepyLoaderProps> = ({ 
  letter = 'Z',
  loadingText = 'Sleeping on it...',
  count = 4
}) => {
  return (
    <div className="sleepy-loader-wrapper">
      <div className="sleepy-container">
        <div className="z-container">
          {Array.from({ length: count }, (_, i) => (
            <div key={i} className={`z z-${i + 1}`}>{letter}</div>
          ))}
        </div>
        {loadingText && <p className="loading-text">{loadingText}</p>}
      </div>
    </div>
  );
}

export default SleepyLoader;