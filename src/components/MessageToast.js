import React, { useEffect, useState } from 'react';

const styles = {
  toast: {
    position: 'fixed',
    bottom: '30px',
    left: '50%',
    transform: 'translateX(-50%)',
    padding: '15px 30px',
    borderRadius: '10px',
    fontWeight: 'bold',
    zIndex: 2000,
    transition: 'all 0.3s',
    boxShadow: '0 5px 20px rgba(0,0,0,0.3)',
  },
  success: {
    background: 'linear-gradient(90deg, #28a745, #20c997)',
    color: '#fff',
  },
  error: {
    background: 'linear-gradient(90deg, #dc3545, #ff6b6b)',
    color: '#fff',
  },
  info: {
    background: 'linear-gradient(90deg, #17a2b8, #20c997)',
    color: '#fff',
  },
  hidden: {
    opacity: 0,
    transform: 'translateX(-50%) translateY(20px)',
    pointerEvents: 'none',
  },
  visible: {
    opacity: 1,
    transform: 'translateX(-50%) translateY(0)',
  },
};

const MessageToast = ({ message, type = 'info', duration = 3000, onClose }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        if (onClose) {
          setTimeout(onClose, 300);
        }
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [message, duration, onClose]);

  if (!message) return null;

  const getTypeStyle = () => {
    if (type === 'success' || message.toLowerCase().includes('success')) {
      return styles.success;
    }
    if (type === 'error' || message.toLowerCase().includes('error')) {
      return styles.error;
    }
    return styles.info;
  };

  return (
    <div
      style={{
        ...styles.toast,
        ...getTypeStyle(),
        ...(visible ? styles.visible : styles.hidden),
      }}
    >
      {message}
    </div>
  );
};

export default MessageToast;
