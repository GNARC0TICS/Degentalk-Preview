import React from 'react';
import './CTAButton.css';

interface CTAButtonProps {
  onClick?: () => void;
  text?: string;
}

const CTAButton: React.FC<CTAButtonProps> = ({ 
  onClick,
  text = 'Launch Now'
}) => {
  return (
    <div className="cta-button-wrapper">
      <button className="super-button" onClick={onClick}>
        <span>{text}</span>
        <svg fill="none" viewBox="0 0 24 24" className="arrow">
          <path strokeLinejoin="round" strokeLinecap="round" strokeWidth={2} stroke="currentColor" d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      </button>
    </div>
  );
}

export default CTAButton;