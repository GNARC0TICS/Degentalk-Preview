import React from 'react';
import './AnimatedCheckbox.css';

interface AnimatedCheckboxProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
}

const AnimatedCheckbox: React.FC<AnimatedCheckboxProps> = ({ 
  checked = false, 
  onChange 
}) => {
  return (
    <div className="animated-checkbox-wrapper">
      <label className="neon-checkbox">
        <input 
          type="checkbox" 
          checked={checked}
          onChange={(e) => onChange?.(e.target.checked)}
        />
        <div className="neon-checkbox__frame">
          <div className="neon-checkbox__box">
            <div className="neon-checkbox__check-container">
              <svg viewBox="0 0 24 24" className="neon-checkbox__check">
                <path d="M3,12.5l7,7L21,5" />
              </svg>
            </div>
            <div className="neon-checkbox__glow" />
            <div className="neon-checkbox__borders">
              <span /><span /><span /><span />
            </div>
          </div>
          <div className="neon-checkbox__effects">
            <div className="neon-checkbox__particles">
              <span /><span /><span /><span />
              <span /><span /><span /><span />
              <span /><span /><span /><span />
            </div>
            <div className="neon-checkbox__rings">
              <div className="ring" />
              <div className="ring" />
              <div className="ring" />
            </div>
            <div className="neon-checkbox__sparks">
              <span /><span /><span /><span />
            </div>
          </div>
        </div>
      </label>
    </div>
  );
}

export default AnimatedCheckbox;