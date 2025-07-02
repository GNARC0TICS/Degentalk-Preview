import React from 'react';
import './DegenLoader.css';

interface DegenLoaderProps {
  loadingText?: string;
  words?: string[];
}

const DegenLoader: React.FC<DegenLoaderProps> = ({ 
  loadingText = 'loading',
  words = [
    'moon missions',
    'diamond hands',
    'ape positions',
    'pump signals',
    'moon missions'
  ]
}) => {
  return (
    <div className="degen-loader-wrapper">
      <div className="card">
        <div className="loader">
          <p>{loadingText}</p>
          <div className="words">
            {words.map((word, index) => (
              <span key={index} className="word">{word}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DegenLoader;