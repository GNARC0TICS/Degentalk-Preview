import React from 'react';
import './PumpButton.css';

interface PumpButtonProps {
  onClick?: () => void;
  text?: string;
}

const PumpButton: React.FC<PumpButtonProps> = ({ 
  onClick,
  text = 'PUMP' 
}) => {
  return (
    <div className="pump-button-wrapper">
      <button onClick={onClick}>{text}</button>
    </div>
  );
}

export default PumpButton;