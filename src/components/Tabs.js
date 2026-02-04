import React from 'react';

const styles = {
  container: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
  },
  tab: {
    padding: '12px 25px',
    borderRadius: '10px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '14px',
    background: 'rgba(255,255,255,0.1)',
    color: '#fff',
    transition: 'all 0.3s',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  tabActive: {
    background: 'linear-gradient(90deg, #e94560, #ff6b6b)',
  },
  tabHover: {
    background: 'rgba(255,255,255,0.2)',
  },
};

const Tabs = ({ tabs, activeTab, onTabChange }) => {
  const [hoveredTab, setHoveredTab] = React.useState(null);

  return (
    <div style={styles.container}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          style={{
            ...styles.tab,
            ...(activeTab === tab.id ? styles.tabActive : {}),
            ...(hoveredTab === tab.id && activeTab !== tab.id ? styles.tabHover : {}),
          }}
          onClick={() => onTabChange(tab.id)}
          onMouseEnter={() => setHoveredTab(tab.id)}
          onMouseLeave={() => setHoveredTab(null)}
        >
          {tab.icon && <span style={{ marginRight: '8px' }}>{tab.icon}</span>}
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default Tabs;
