import React from 'react';

const styles = {
  header: {
    background: 'rgba(0,0,0,0.3)',
    padding: '15px 30px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
  },
  logo: {
    fontSize: '24px',
    fontWeight: 'bold',
    background: 'linear-gradient(90deg, #e94560, #ff6b6b)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  sessionInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
  },
  badge: {
    background: '#e94560',
    padding: '5px 15px',
    borderRadius: '20px',
    fontSize: '12px',
  },
  button: {
    padding: '10px 20px',
    borderRadius: '10px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: 'bold',
    background: '#dc3545',
    color: '#fff',
    transition: 'all 0.3s',
  },
};

const Header = ({ session, onCloseSession }) => {
  return (
    <header style={styles.header}>
      <div style={styles.logo}>POS System</div>
      <div style={styles.sessionInfo}>
        <span>Cashier: {session.cashierName}</span>
        <span style={styles.badge}>Session #{session.id}</span>
        <button style={styles.button} onClick={onCloseSession}>
          Close Session
        </button>
      </div>
    </header>
  );
};

export default Header;
