import React from 'react';
import type { HeaderProps } from '../types';
import './Header.css';

const Header: React.FC<HeaderProps> = ({ user }) => {
  return (
    <header className="header">
      <div className="header-left">
        <div className="logo-section">
          <div className="logo">
            <img src="/hp-logo.png" alt="HP" className="logo-image" />
            <span className="logo-text">PrintOS</span>
          </div>
        </div>
      </div>
      
      <div className="header-right">
        <div className="notification-icon">
          <span className="notification-badge">1</span>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 2a6 6 0 00-6 6c0 1.887-.454 3.665-1.257 5.234a.75.75 0 00.515 1.076A9.06 9.06 0 004.252 14.5h11.496c.327 0 .64-.446.515-1.076C15.454 11.665 15 9.887 15 8a6 6 0 00-6-6zM6.75 15a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5z"/>
          </svg>
        </div>
        
        <div className="user-profile">
          <div className="user-info">
            <span className="user-name">{user.name}</span>
            <span className="user-role">{user.role}</span>
          </div>
          <img src={user.avatar} alt={user.name} className="user-avatar" />
        </div>
      </div>
    </header>
  );
};

export default Header;
