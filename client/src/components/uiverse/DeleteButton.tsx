import React from 'react';
import './DeleteButton.css';

interface DeleteButtonProps {
  onClick?: () => void;
  text?: string;
  disabled?: boolean;
  className?: string;
}

const DeleteButton: React.FC<DeleteButtonProps> = ({ 
  onClick,
  text = 'Delete',
  disabled = false,
  className = ''
}) => {
  return (
    <div className={`delete-button-wrapper ${className}`}>
      <button 
        className="noselect" 
        onClick={onClick} 
        disabled={disabled}
      >
        <span className="text">{text}</span>
        <span className="icon">
          <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24">
            <path d="M24 20.188l-8.315-8.209 8.2-8.282-3.697-3.697-8.212 8.318-8.31-8.203-3.666 3.666 8.321 8.24-8.206 8.313 3.666 3.666 8.237-8.318 8.285 8.203z" />
          </svg>
        </span>
      </button>
    </div>
  );
}

export default DeleteButton;