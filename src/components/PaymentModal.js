import React from 'react';

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
    borderRadius: '20px',
    padding: '30px',
    maxWidth: '450px',
    width: '90%',
    border: '1px solid rgba(255,255,255,0.2)',
  },
  header: {
    textAlign: 'center',
    marginBottom: '25px',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '10px',
  },
  amount: {
    fontSize: '36px',
    fontWeight: 'bold',
    color: '#e94560',
  },
  paymentOptions: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '15px',
    marginBottom: '25px',
  },
  paymentBtn: {
    padding: '25px 20px',
    borderRadius: '15px',
    border: '2px solid rgba(255,255,255,0.2)',
    background: 'rgba(255,255,255,0.05)',
    color: '#fff',
    cursor: 'pointer',
    transition: 'all 0.3s',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px',
  },
  paymentBtnHover: {
    borderColor: '#e94560',
    background: 'rgba(233, 69, 96, 0.1)',
  },
  paymentIcon: {
    fontSize: '40px',
  },
  paymentLabel: {
    fontSize: '16px',
    fontWeight: 'bold',
  },
  cancelBtn: {
    width: '100%',
    padding: '15px',
    borderRadius: '10px',
    border: '1px solid rgba(255,255,255,0.2)',
    background: 'transparent',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '16px',
    transition: 'all 0.3s',
  },
  summary: {
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '10px',
    padding: '15px',
    marginBottom: '20px',
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '8px',
    fontSize: '14px',
  },
  divider: {
    height: '1px',
    background: 'rgba(255,255,255,0.2)',
    margin: '10px 0',
  },
};

const PaymentModal = ({ totals, onPayment, onCancel, loading }) => {
  const [hoveredBtn, setHoveredBtn] = React.useState(null);
  const { subtotal, totalDiscount, totalTax, total } = totals;

  return (
    <div style={styles.overlay} onClick={onCancel}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <div style={styles.title}>Complete Payment</div>
          <div style={styles.amount}>${total.toFixed(2)}</div>
        </div>

        <div style={styles.summary}>
          <div style={styles.summaryRow}>
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          {totalDiscount > 0 && (
            <div style={{ ...styles.summaryRow, color: '#28a745' }}>
              <span>Discount</span>
              <span>-${totalDiscount.toFixed(2)}</span>
            </div>
          )}
          <div style={styles.summaryRow}>
            <span>Tax</span>
            <span>${totalTax.toFixed(2)}</span>
          </div>
          <div style={styles.divider} />
          <div style={{ ...styles.summaryRow, fontWeight: 'bold', fontSize: '16px' }}>
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>

        <div style={styles.paymentOptions}>
          <button
            style={{
              ...styles.paymentBtn,
              ...(hoveredBtn === 'CASH' ? styles.paymentBtnHover : {}),
            }}
            onClick={() => onPayment('CASH')}
            onMouseEnter={() => setHoveredBtn('CASH')}
            onMouseLeave={() => setHoveredBtn(null)}
            disabled={loading}
          >
            <span style={styles.paymentIcon}>💵</span>
            <span style={styles.paymentLabel}>Cash</span>
          </button>

          <button
            style={{
              ...styles.paymentBtn,
              ...(hoveredBtn === 'CARD' ? styles.paymentBtnHover : {}),
            }}
            onClick={() => onPayment('CARD')}
            onMouseEnter={() => setHoveredBtn('CARD')}
            onMouseLeave={() => setHoveredBtn(null)}
            disabled={loading}
          >
            <span style={styles.paymentIcon}>💳</span>
            <span style={styles.paymentLabel}>Card</span>
          </button>
        </div>

        <button
          style={styles.cancelBtn}
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default PaymentModal;
