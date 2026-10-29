import React from 'react';

export default function AppHeader({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'watchtower', label: 'Watchtower', sub: 'Spot Finder' },
    { id: 'scroll', label: 'Celestial Scroll', sub: 'Events & Moon' },
    { id: 'spirit-lens', label: 'Spirit Lens', sub: 'Image Dojo' },
  ];

  return (
    <header className="app-header">
      <div className="header-brand">
        <div className="torii-symbol">⛩️</div>
        <div>
          <h1 className="header-title">月読 TSUKUYOMI WATCH</h1>
          <p className="header-subtitle">The Samurai's Celestial Guide</p>
        </div>
      </div>

      <nav className="header-nav">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
          >
            <span className="tab-title">{tab.label}</span>
            <span className="tab-sub">{tab.sub}</span>
          </button>
        ))}
      </nav>
    </header>
  );
}