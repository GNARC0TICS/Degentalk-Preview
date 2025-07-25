import React from 'react';
import './Red3DButton.css';

interface Red3DButtonProps {
  onClick?: () => void;
  text?: string;
  disabled?: boolean;
  className?: string;
}

const Red3DButton: React.FC<Red3DButtonProps> = ({ 
  onClick,
  text = 'Click me',
  disabled = false,
  className = ''
}) => {
  return (
    <div className={`red-3d-button-wrapper ${className}`}>
      <button onClick={onClick} disabled={disabled}>
        <span className="shadow" />
        <span className="edge" />
        <span className="front text">{text}</span>
      </button>
    </div>
  );
}

export default Red3DButton;