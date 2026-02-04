import React, { useEffect } from 'react';
import printReceipt from './receiptPrinter';

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
    padding: '40px',
    maxWidth: '450px',
    width: '90%',
    border: '1px solid rgba(255,255,255,0.2)',
    textAlign: 'center',
  },
  successIcon: {
    width: '80px',
    height: '80px',
    background: 'linear-gradient(135deg, #28a745, #20c997)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 20px',
    fontSize: '40px',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '10px',
    color: '#28a745',
  },
  orderNumber: {
    fontSize: '18px',
    color: 'rgba(255,255,255,0.8)',
    marginBottom: '25px',
  },
  orderNumberValue: {
    fontWeight: 'bold',
    color: '#e94560',
  },
  details: {
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '15px',
    padding: '20px',
    marginBottom: '25px',
  },
  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '10px',
    fontSize: '14px',
  },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '20px',
    fontWeight: 'bold',
    paddingTop: '15px',
    borderTop: '1px solid rgba(255,255,255,0.2)',
    marginTop: '10px',
  },
  paymentMethod: {
    display: 'inline-block',
    background: 'rgba(233, 69, 96, 0.2)',
    color: '#e94560',
    padding: '5px 15px',
    borderRadius: '20px',
    marginBottom: '20px',
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
    transition: 'transform 0.2s',
    marginBottom: '10px',
  },
  printButton: {
    width: '100%',
    padding: '15px',
    borderRadius: '10px',
    border: '1px solid rgba(255,255,255,0.3)',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '16px',
    background: 'transparent',
    color: '#fff',
    transition: 'transform 0.2s',
  },
  timestamp: {
    fontSize: '12px',
    color: 'rgba(255,255,255,0.5)',
    marginTop: '15px',
  },
};

const OrderComplete = ({ order, onClose, companyInfo }) => {
  // Automatically print receipt when order is complete
  useEffect(() => {
    if (order) {
      // Small delay to ensure modal is rendered first
      setTimeout(() => {
        handlePrint();
      }, 500);
    }
  }, [order]);

  if (!order) return null;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const handlePrint = () => {
    // Default company info if not provided
    const defaultCompanyInfo = {
      companyName: 'Your Company Name',
      vat: '123456789012345',
      configName: 'Main POS',
      address: 'الرحاب - شارع التحلية (الامير محمد)',
      city: 'الرحاب - جدة - 1669, مكة 192',
      country: 'المملكة العربية السعودية',
      ...companyInfo
    };

    printReceipt(order, defaultCompanyInfo);
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.successIcon}>✓</div>
        
        <div style={styles.title}>Payment Successful!</div>
        
        <div style={styles.orderNumber}>
          Order Number: <span style={styles.orderNumberValue}>{order.orderNumber}</span>
        </div>

        <div style={styles.paymentMethod}>
          {order.paymentMethod === 'CASH' ? '💵' : '💳'} {order.paymentMethod}
        </div>

        <div style={styles.details}>
          <div style={styles.detailRow}>
            <span>Subtotal</span>
            <span>${order.subtotal?.toFixed(2) || '0.00'}</span>
          </div>
          
          {order.discountAmount > 0 && (
            <div style={{ ...styles.detailRow, color: '#28a745' }}>
              <span>Discount</span>
              <span>-${order.discountAmount.toFixed(2)}</span>
            </div>
          )}
          
          <div style={styles.detailRow}>
            <span>Tax</span>
            <span>${order.taxAmount?.toFixed(2) || '0.00'}</span>
          </div>
          
          <div style={styles.totalRow}>
            <span>Total Paid</span>
            <span style={{ color: '#e94560' }}>
              ${order.totalAmount?.toFixed(2) || '0.00'}
            </span>
          </div>
        </div>

        <button 
          style={styles.button} 
          onClick={onClose}
          onMouseEnter={(e) => e.target.style.transform = 'scale(1.02)'}
          onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
        >
          New Transaction
        </button>

        <button 
          style={styles.printButton} 
          onClick={handlePrint}
          onMouseEnter={(e) => e.target.style.transform = 'scale(1.02)'}
          onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
        >
          🖨️ Print Receipt Again
        </button>

        <div style={styles.timestamp}>
          {order.createdAt ? formatDate(order.createdAt) : 'Just now'}
        </div>
      </div>
    </div>
  );
};

export default OrderComplete;
