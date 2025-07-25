import React from 'react';
import './BrutalistCard.css';

interface BrutalistCardProps {
  title?: string;
  message?: string;
  primaryButtonText?: string;
  secondaryButtonText?: string;
  onPrimaryClick?: () => void;
  onSecondaryClick?: () => void;
}

const BrutalistCard: React.FC<BrutalistCardProps> = ({ 
  title = 'Warning',
  message = 'This is a brutalist card with a very angry button. Proceed with caution, you\'ve been warned.',
  primaryButtonText = 'Okay',
  secondaryButtonText = 'Mark as Read',
  onPrimaryClick,
  onSecondaryClick
}) => {
  return (
    <div className="brutalist-card-wrapper">
      <div className="brutalist-card">
        <div className="brutalist-card__header">
          <div className="brutalist-card__icon">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
            </svg>
          </div>
          <div className="brutalist-card__alert">{title}</div>
        </div>
        <div className="brutalist-card__message">{message}</div>
        <div className="brutalist-card__actions">
          <button 
            className="brutalist-card__button brutalist-card__button--mark" 
            onClick={onSecondaryClick}
          >
            {secondaryButtonText}
          </button>
          <button 
            className="brutalist-card__button brutalist-card__button--read" 
            onClick={onPrimaryClick}
          >
            {primaryButtonText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default BrutalistCard;