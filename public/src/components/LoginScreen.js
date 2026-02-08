import React, { useState } from 'react';

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modal: {
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '20px',
    padding: '40px',
    maxWidth: '450px',
    width: '90%',
    border: '1px solid rgba(255,255,255,0.2)',
    backdropFilter: 'blur(10px)',
  },
  logo: {
    fontSize: '32px',
    fontWeight: 'bold',
    background: 'linear-gradient(90deg, #e94560, #ff6b6b)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    textAlign: 'center',
    marginBottom: '10px',
  },
  subtitle: {
    textAlign: 'center',
    color: 'rgba(255,255,255,0.6)',
    marginBottom: '30px',
  },
  title: {
    color: '#fff',
    marginBottom: '25px',
    fontSize: '20px',
  },
  input: {
    width: '100%',
    padding: '15px',
    borderRadius: '10px',
    border: '2px solid rgba(255,255,255,0.2)',
    background: 'rgba(255,255,255,0.1)',
    color: '#fff',
    fontSize: '16px',
    outline: 'none',
    marginBottom: '15px',
    boxSizing: 'border-box',
    transition: 'border-color 0.3s',
  },
  button: {
    width: '100%',
    padding: '15px',
    borderRadius: '10px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '16px',
    background: 'linear-gradient(90deg, #e94560, #ff6b6b)',
    color: '#fff',
    transition: 'transform 0.2s, box-shadow 0.2s',
    marginTop: '10px',
  },
  message: {
    textAlign: 'center',
    marginTop: '15px',
    color: '#e94560',
    fontSize: '14px',
  },
  inputFocus: {
    borderColor: '#e94560',
  },
};

const LoginScreen = ({ onOpenSession, loading, message }) => {
  const [cashierName, setCashierName] = useState('');
  const [openingCash, setOpeningCash] = useState('');
  const [focusedInput, setFocusedInput] = useState(null);

  const handleSubmit = () => {
    if (!cashierName.trim()) {
      return;
    }
    onOpenSession({
      cashierName: cashierName.trim(),
      openingCash: parseFloat(openingCash) || 0,
    });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.logo}>POS System</div>
        <p style={styles.subtitle}>Point of Sale Terminal</p>
        
        <h3 style={styles.title}>Open New Session</h3>
        
        <input
          style={{
            ...styles.input,
            ...(focusedInput === 'name' ? styles.inputFocus : {}),
          }}
          placeholder="Enter your name"
          value={cashierName}
          onChange={(e) => setCashierName(e.target.value)}
          onKeyPress={handleKeyPress}
          onFocus={() => setFocusedInput('name')}
          onBlur={() => setFocusedInput(null)}
          autoFocus
        />
        
        <input
          style={{
            ...styles.input,
            ...(focusedInput === 'cash' ? styles.inputFocus : {}),
          }}
          placeholder="Opening cash amount (optional)"
          type="number"
          min="0"
          step="0.01"
          value={openingCash}
          onChange={(e) => setOpeningCash(e.target.value)}
          onKeyPress={handleKeyPress}
          onFocus={() => setFocusedInput('cash')}
          onBlur={() => setFocusedInput(null)}
        />
        
        <button
          style={{
            ...styles.button,
            opacity: loading ? 0.7 : 1,
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? 'Opening Session...' : 'Start Session'}
        </button>
        
        {message && <p style={styles.message}>{message}</p>}
      </div>
    </div>
  );
};

export default LoginScreen;
