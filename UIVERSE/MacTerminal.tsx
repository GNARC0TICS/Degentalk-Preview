import React from 'react';
import './MacTerminal.css';

interface MacTerminalProps {
  user?: string;
  location?: string;
  command?: string;
}

const MacTerminal: React.FC<MacTerminalProps> = ({
  user = 'uiverse@admin',
  location = '~',
  command = 'welcome to uiverse'
}) => {
  return (
    <div className="mac-terminal-wrapper">
      <div className="container glass">
        <div className="terminal_toolbar">
          <div className="butt">
            <button className="btn btn-red" />
            <button className="btn btn-yellow" />
            <button className="btn btn-green" />
          </div>
          <p className="user">{user}: {location}</p>
          <div className="add_tab">+</div>
        </div>
        <div className="terminal_body">
          <div className="terminal_promt">
            <span className="terminal_user">{user}:</span>
            <span className="terminal_location">{location}</span>
            <span className="terminal_bling">$ {command}</span>
            <span className="terminal_cursor" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default MacTerminal;