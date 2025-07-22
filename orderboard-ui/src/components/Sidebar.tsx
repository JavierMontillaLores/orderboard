import React from 'react';
import type { SidebarProps } from '../types';
import './Sidebar.css';

const Sidebar: React.FC<SidebarProps> = ({ activeItem = 'Orders', isCollapsed = false, onCollapseChange }) => {
  const toggleCollapse = () => {
    const newCollapsed = !isCollapsed;
    onCollapseChange?.(newCollapsed);
  };

  const menuItems = [
    { 
      name: 'Orders', 
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
          <rect x="3" y="4" width="14" height="1"/>
          <rect x="3" y="7" width="14" height="1"/>
          <rect x="3" y="10" width="14" height="1"/>
          <rect x="3" y="13" width="14" height="1"/>
        </svg>
      ), 
      path: '/orders' 
    },
  ];

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <button 
          className="collapse-btn"
          onClick={toggleCollapse}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className={`collapse-icon ${isCollapsed ? 'rotated' : ''}`}>
            <path d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"/>
          </svg>
        </button>
      </div>
      
      <nav className="sidebar-nav">
        <ul className="menu-list">
          {menuItems.map((item) => (
            <li key={item.name} className={`menu-item ${activeItem === item.name ? 'active' : ''}`}>
              <a href={item.path} className="menu-link" title={isCollapsed ? item.name : undefined}>
                <span className="menu-icon">{item.icon}</span>
                <span className="menu-text">{item.name}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
