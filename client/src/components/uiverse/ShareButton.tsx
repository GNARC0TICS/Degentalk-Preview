import React from 'react';
import './ShareButton.css';

interface ShareButtonProps {
  buttonText?: string;
  onTwitterClick?: () => void;
  onFacebookClick?: () => void;
  onInstagramClick?: () => void;
}

const ShareButton: React.FC<ShareButtonProps> = ({ 
  buttonText = 'Share',
  onTwitterClick,
  onFacebookClick,
  onInstagramClick
}) => {
  return (
    <div className="share-button-wrapper">
      <div className="group-btn">
        <div className="tooltip-container">
          <div className="social-icons">
            <div className="social-tooltip twitter" onClick={onTwitterClick}>
              <span className="sr-only">X</span>
              <a href="#">
                <span className="social-icon-svg">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 520 520">
                    <path d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z" />
                  </svg>
                </span>
              </a>
            </div>
            <div className="social-tooltip facebook" onClick={onFacebookClick}>
              <span className="sr-only">facebook</span>
              <a href="#">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={24} height={24}>
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
            </div>
            <div className="social-tooltip instagram" onClick={onInstagramClick}>
              <span className="sr-only">Instagram</span>
              <a href="#">
                <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width={26} height={26} fill="none" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M3 8a5 5 0 0 1 5-5h8a5 5 0 0 1 5 5v8a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5V8Zm5-3a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3V8a3 3 0 0 0-3-3H8Zm7.597 2.214a1 1 0 0 1 1-1h.01a1 1 0 1 1 0 2h-.01a1 1 0 0 1-1-1ZM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm-5 3a5 5 0 1 1 10 0 5 5 0 0 1-10 0Z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>
          <div className="tooltip-arrow" />
        </div>
        <div className="share-button">
          <button className="share-btn">
            <span className="share-text">{buttonText}</span>
            <svg className="share-icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width={24} height={24} fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.5 3a3.5 3.5 0 0 0-3.456 4.06L8.143 9.704a3.5 3.5 0 1 0-.01 4.6l5.91 2.65a3.5 3.5 0 1 0 .863-1.805l-5.94-2.662a3.53 3.53 0 0 0 .002-.961l5.948-2.667A3.5 3.5 0 1 0 17.5 3Z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default ShareButton;