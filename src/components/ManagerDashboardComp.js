import React, { useState, useEffect } from 'react';
import { sessionApi, employeeApi } from '../services/api';

const fc = (amount) => `${(Number(amount) || 0).toFixed(2)} ﷼`;

const styles = {
  app: { minHeight: '100vh', background: '#f5f7fa', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", color: '#333' },
  header: { background: '#fff', padding: '15px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e0e0e0', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' },
  logo: { fontSize: '24px', fontWeight: 'bold', color: '#2563eb' },
  sessionInfo: { display: 'flex', alignItems: 'center', gap: '15px' },
  badge: { background: '#28a745', color: '#fff', padding: '5px 15px', borderRadius: '20px', fontSize: '12px' },
  button: { padding: '12px 25px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.3s' },
  dangerBtn: { background: '#dc3545', color: '#fff' },
  successBtn: { background: '#28a745', color: '#fff' },
  primaryBtn: { background: '#2563eb', color: '#fff' },
  warningBtn: { background: '#ffc107', color: '#000' },
  main: { padding: '30px', maxWidth: '1600px', margin: '0 auto' },
  tabs: { display: 'flex', gap: '15px', marginBottom: '20px', justifyContent: 'center' },
  tab: { padding: '15px 40px', borderRadius: '12px', border: '2px solid #e0e0e0', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', background: '#fff', color: '#666', transition: 'all 0.3s', boxShadow: '0 2px 6px rgba(0,0,0,0.08)' },
  tabActive: { background: '#2563eb', color: '#fff', borderColor: '#2563eb', transform: 'translateY(-2px)', boxShadow: '0 4px 12px rgba(37,99,235,0.3)' },
  sessionGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', marginTop: '20px' },
  sessionCard: { background: '#fff', borderRadius: '15px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', cursor: 'pointer', transition: 'all 0.3s', border: '2px solid transparent' },
  table: { width: '100%', borderCollapse: 'collapse', marginTop: '20px', background: '#fff', borderRadius: '15px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  th: { background: '#f8f9fa', padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6', fontWeight: 'bold' },
  td: { padding: '12px', borderBottom: '1px solid #dee2e6', textAlign: 'left' },
  modal: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modalContent: { background: '#fff', borderRadius: '20px', padding: '30px', maxWidth: '500px', width: '90%', boxShadow: '0 10px 40px rgba(0,0,0,0.3)', maxHeight: '90vh', overflow: 'auto' },
  input: { width: '100%', padding: '15px', borderRadius: '10px', border: '2px solid #e0e0e0', background: '#fff', color: '#333', fontSize: '16px', outline: 'none', marginBottom: '15px', boxSizing: 'border-box' },
  checkbox: { width: '20px', height: '20px', cursor: 'pointer' },
  toast: { position: 'fixed', bottom: '30px', left: '50%', transform: 'translateX(-50%)', padding: '15px 30px', borderRadius: '10px', background: '#333', color: '#fff', fontWeight: 'bold', zIndex: 2000 },
  infoBox: { background: '#e7f3ff', border: '2px solid #2563eb', borderRadius: '10px', padding: '15px', marginBottom: '15px', fontSize: '14px' },
};

function ManagerDashboard({ employee, companyInfo, onLogout, onSelectSession, onOpenNewSession }) {
  const [view, setView] = useState('sessions');
  const [sessions, setSessions] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [showEmployeeForm, setShowEmployeeForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [employeeForm, setEmployeeForm] = useState({ employeeId: '', badgeId: '', name: '', pin: '', saleUser: true, returnUser: false, managerUser: false, active: true });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const showMessage = (msg) => { setMessage(msg); setTimeout(() => setMessage(''), 3000); };

  useEffect(() => {
    if (view === 'sessions') loadSessions();
    if (view === 'users') loadEmployees();
  }, [view]);

  const loadSessions = async () => {
    try {
      const res = await sessionApi.getOpen();
      setSessions(res.data || []);
    } catch (error) {
      showMessage('خطأ في تحميل الجلسات');
    }
  };

  const loadEmployees = async () => {
    try {
      const res = await employeeApi.getAll();
      setEmployees(res.data || []);
    } catch (error) {
      showMessage('خطأ في تحميل الموظفين');
    }
  };

  const handleSaveEmployee = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (editingEmployee) {
        await employeeApi.update(editingEmployee.id, employeeForm);
        showMessage('تم تحديث الموظف');
      } else {
        await employeeApi.create(employeeForm);
        showMessage('تم إضافة الموظف');
      }
      await loadEmployees();
      setShowEmployeeForm(false);
      setEditingEmployee(null);
      setEmployeeForm({ employeeId: '', badgeId: '', name: '', pin: '', saleUser: true, returnUser: false, managerUser: false, active: true });
    } catch (error) {
      showMessage(error.response?.data?.error || 'خطأ في حفظ الموظف');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (emp) => {
    try {
      if (emp.active) await employeeApi.deactivate(emp.id);
      else await employeeApi.activate(emp.id);
      await loadEmployees();
      showMessage(emp.active ? 'تم تعطيل الموظف' : 'تم تفعيل الموظف');
    } catch (error) {
      showMessage('خطأ في تحديث الموظف');
    }
  };

  return (
    <div style={styles.app}>
      <div style={styles.header}>
        <div style={styles.logo}>💼 Manager Dashboard - {companyInfo.companyName}</div>
        <div style={styles.sessionInfo}>
          <span style={styles.badge}>Manager: {employee.name}</span>
          <button style={{ ...styles.button, ...styles.dangerBtn }} onClick={onLogout}>Logout / تسجيل الخروج</button>
        </div>
      </div>

      <div style={styles.main}>
        <div style={styles.tabs}>
          <div style={{ ...styles.tab, ...(view === 'sessions' ? styles.tabActive : {}) }} onClick={() => setView('sessions')}>
            📊 Open Sessions / الجلسات المفتوحة
          </div>
          <div style={{ ...styles.tab, ...(view === 'users' ? styles.tabActive : {}) }} onClick={() => setView('users')}>
            👥 Manage Users / إدارة الموظفين
          </div>
          <div style={styles.tab} onClick={onOpenNewSession}>
            🛒 Open New POS / فتح نقطة بيع
          </div>
        </div>

        {view === 'sessions' && (
          <div>
            <h2>Open Sessions ({sessions.length})</h2>
            {sessions.length === 0 ? (
              <div style={styles.infoBox}>No open sessions. Click "Open New POS" to start.</div>
            ) : (
              <div style={styles.sessionGrid}>
                {sessions.map((sess) => (
                  <div
                    key={sess.id}
                    style={styles.sessionCard}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(37,99,235,0.2)'; e.currentTarget.style.borderColor = '#2563eb'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)'; e.currentTarget.style.borderColor = 'transparent'; }}
                  >
                    <h3>👤 {sess.cashierName}</h3>
                    <div style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>
                      <div>Session #{sess.sessionNumber}</div>
                      <div>Opening Cash: {fc(sess.openingCash)}</div>
                      <div>Sales: {fc(sess.totalSales)}</div>
                      <div>Transactions: {sess.transactionCount}</div>
                      <div style={{ marginTop: '10px', fontSize: '12px', color: '#999' }}>
                        Opened: {new Date(sess.openedAt).toLocaleString()}
                      </div>
                    </div>
                    <button style={{ ...styles.button, ...styles.primaryBtn, width: '100%', marginTop: '15px' }} onClick={() => onSelectSession(sess)}>
                      Manage Session / إدارة الجلسة
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {view === 'users' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2>Employees ({employees.length})</h2>
              <button style={{ ...styles.button, ...styles.successBtn }} onClick={() => setShowEmployeeForm(true)}>
                ➕ Add Employee / إضافة موظف
              </button>
            </div>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Name</th>
                  <th style={styles.th}>Employee ID</th>
                  <th style={styles.th}>Sales</th>
                  <th style={styles.th}>Returns</th>
                  <th style={styles.th}>Manager</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => (
                  <tr key={emp.id}>
                    <td style={styles.td}>{emp.name}</td>
                    <td style={styles.td}>{emp.employeeId}</td>
                    <td style={styles.td}>{emp.saleUser ? '✅' : '❌'}</td>
                    <td style={styles.td}>{emp.returnUser ? '✅' : '❌'}</td>
                    <td style={styles.td}>{emp.managerUser ? '✅' : '❌'}</td>
                    <td style={styles.td}>{emp.active ? <span style={{ color: '#28a745' }}>✅ Active</span> : <span style={{ color: '#dc3545' }}>❌ Inactive</span>}</td>
                    <td style={styles.td}>
                      <button style={{ ...styles.button, ...styles.primaryBtn, fontSize: '12px', padding: '8px 15px', marginRight: '5px' }}
                        onClick={() => { setEditingEmployee(emp); setEmployeeForm({ ...emp, pin: '' }); setShowEmployeeForm(true); }}>
                        Edit
                      </button>
                      <button style={{ ...styles.button, ...(emp.active ? styles.warningBtn : styles.successBtn), fontSize: '12px', padding: '8px 15px' }}
                        onClick={() => handleToggleActive(emp)}>
                        {emp.active ? 'Disable' : 'Enable'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showEmployeeForm && (
        <div style={styles.modal} onClick={() => setShowEmployeeForm(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2>{editingEmployee ? 'Edit Employee' : 'Add Employee'}</h2>
            <form onSubmit={handleSaveEmployee}>
              <label>Employee ID (Barcode)</label>
              <input type="text" style={styles.input} value={employeeForm.employeeId} onChange={(e) => setEmployeeForm({ ...employeeForm, employeeId: e.target.value })} required disabled={!!editingEmployee} />
              
              <label>Badge ID (Optional)</label>
              <input type="text" style={styles.input} value={employeeForm.badgeId} onChange={(e) => setEmployeeForm({ ...employeeForm, badgeId: e.target.value })} />
              
              <label>Name</label>
              <input type="text" style={styles.input} value={employeeForm.name} onChange={(e) => setEmployeeForm({ ...employeeForm, name: e.target.value })} required />
              
              <label>PIN</label>
              <input type="password" style={styles.input} value={employeeForm.pin} onChange={(e) => setEmployeeForm({ ...employeeForm, pin: e.target.value })} 
                required={!editingEmployee} placeholder={editingEmployee ? 'Leave blank to keep current' : ''} />
              
              <div style={{ marginBottom: '15px' }}>
                <label><input type="checkbox" style={styles.checkbox} checked={employeeForm.saleUser} onChange={(e) => setEmployeeForm({ ...employeeForm, saleUser: e.target.checked })} /> Sales Permission</label>
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label><input type="checkbox" style={styles.checkbox} checked={employeeForm.returnUser} onChange={(e) => setEmployeeForm({ ...employeeForm, returnUser: e.target.checked })} /> Returns Permission</label>
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label><input type="checkbox" style={styles.checkbox} checked={employeeForm.managerUser} onChange={(e) => setEmployeeForm({ ...employeeForm, managerUser: e.target.checked })} /> Manager Permission</label>
              </div>
              
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button type="submit" style={{ ...styles.button, ...styles.successBtn, flex: 1 }}>💾 Save</button>
                <button type="button" style={{ ...styles.button, ...styles.dangerBtn, flex: 1 }} onClick={() => { setShowEmployeeForm(false); setEditingEmployee(null); }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {message && <div style={styles.toast}>{message}</div>}
    </div>
  );
}

export default ManagerDashboard;