import React, { useState } from 'react';

const styles = {
  container: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  box: { background: '#fff', borderRadius: '20px', padding: '40px', maxWidth: '450px', width: '90%', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' },
  title: { fontSize: '28px', fontWeight: 'bold', color: '#2563eb', textAlign: 'center', marginBottom: '30px' },
  subtitle: { fontSize: '14px', color: '#666', textAlign: 'center', marginBottom: '25px' },
  input: { width: '100%', padding: '15px', borderRadius: '10px', border: '2px solid #e0e0e0', background: '#fff', color: '#333', fontSize: '16px', outline: 'none', marginBottom: '15px', boxSizing: 'border-box' },
  button: { padding: '12px 25px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: 'bold', background: '#2563eb', color: '#fff', width: '100%', fontSize: '16px' },
  error: { color: '#dc3545', fontSize: '12px', marginBottom: '10px' },
};

function Login({ onLogin }) {
  const [employeeId, setEmployeeId] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      await onLogin(employeeId, pin);
    } catch (err) {
      setError(err.message || 'خطأ في تسجيل الدخول');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.box}>
        <div style={styles.title}>🛒 نظام نقطة البيع</div>
        <div style={styles.subtitle}>Scan barcode and enter PIN / مسح الباركود وإدخال الرقم السري</div>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            style={styles.input}
            placeholder="Employee Barcode / باركود الموظف"
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
            disabled={loading}
            autoFocus
          />
          <input
            type="password"
            style={styles.input}
            placeholder="PIN / الرقم السري"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            disabled={loading}
          />
          {error && <div style={styles.error}>{error}</div>}
          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? 'جاري تسجيل الدخول...' : 'Login / تسجيل الدخول'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;