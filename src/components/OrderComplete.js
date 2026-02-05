import React, { useEffect } from 'react';
import printReceipt from './receiptPrinter';

const styles = {
  overlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center',
    justifyContent: 'center', zIndex: 1000,
  },
  modal: {
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
    borderRadius: '20px', padding: '30px', maxWidth: '450px', width: '90%',
    border: '1px solid rgba(255,255,255,0.2)', textAlign: 'center',
    maxHeight: '85vh', overflowY: 'auto',
  },
  successIcon: {
    width: '70px', height: '70px',
    background: 'linear-gradient(135deg, #28a745, #20c997)',
    borderRadius: '50%', display: 'flex', alignItems: 'center',
    justifyContent: 'center', margin: '0 auto 15px', fontSize: '35px',
  },
  title: { fontSize: '22px', fontWeight: 'bold', marginBottom: '8px', color: '#28a745' },
  orderNumber: { fontSize: '16px', color: 'rgba(255,255,255,0.8)', marginBottom: '20px' },
  orderNumberValue: { fontWeight: 'bold', color: '#e94560' },
  details: {
    background: 'rgba(255,255,255,0.05)', borderRadius: '15px',
    padding: '15px', marginBottom: '20px',
  },
  detailRow: { display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' },
  totalRow: {
    display: 'flex', justifyContent: 'space-between', fontSize: '18px',
    fontWeight: 'bold', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.2)', marginTop: '8px',
  },
  paymentMethod: {
    display: 'inline-block', background: 'rgba(233, 69, 96, 0.2)',
    color: '#e94560', padding: '5px 15px', borderRadius: '20px', marginBottom: '15px',
  },
  rewardBadge: {
    background: 'rgba(34, 197, 94, 0.15)', borderRadius: '8px', padding: '8px 12px',
    marginBottom: '8px', textAlign: 'left', borderLeft: '3px solid #22c55e',
  },
  button: {
    width: '100%', padding: '14px', borderRadius: '10px', border: 'none',
    cursor: 'pointer', fontWeight: 'bold', fontSize: '15px',
    background: 'linear-gradient(90deg, #e94560, #ff6b6b)', color: '#fff',
    transition: 'transform 0.2s', marginBottom: '8px',
  },
  printButton: {
    width: '100%', padding: '14px', borderRadius: '10px',
    border: '1px solid rgba(255,255,255,0.3)', cursor: 'pointer',
    fontWeight: 'bold', fontSize: '15px', background: 'transparent', color: '#fff',
    transition: 'transform 0.2s',
  },
  timestamp: { fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginTop: '12px' },
};

const OrderComplete = ({ order, onClose, companyInfo }) => {
  useEffect(() => {
    if (order) {
      setTimeout(() => { handlePrint(); }, 500);
    }
  }, [order]);

  if (!order) return null;

  const formatDate = (dateString) => new Date(dateString).toLocaleString();

  const handlePrint = () => {
    const defaultCompanyInfo = {
      companyName: 'كيو',
      vat: '312001752300003',
      configName: 'Main POS',
      address: 'شارع الأمير محمد بن عبدالعزيز',
      city: 'جدة',
      country: 'Saudi Arabia',
      ...companyInfo
    };
    printReceipt(order, defaultCompanyInfo);
  };

  // Use loyaltyBreakdown directly from order
  const loyaltyBreakdown = order.loyaltyBreakdown || [];

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.successIcon}>✓</div>
        <div style={styles.title}>Payment Successful!</div>
        <div style={styles.orderNumber}>
          Order: <span style={styles.orderNumberValue}>{order.orderNumber}</span>
        </div>

        <div style={styles.paymentMethod}>
          {order.paymentMethod === 'CASH' ? '💵' : '💳'} {order.paymentMethod}
        </div>

        {/* Loyalty Sections — each program listed separately */}
        {loyaltyBreakdown.length > 0 && (
          <div style={{ marginBottom: '15px' }}>
            {loyaltyBreakdown.map((entry, idx) => (
              <div key={idx} style={{
                background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '10px 12px',
                marginBottom: '8px', borderLeft: '3px solid rgba(255,255,255,0.3)', textAlign: 'left',
              }}>
                <div style={{ fontWeight: 'bold', fontSize: '12px', color: '#fff', marginBottom: '4px' }}>
                  {entry.loyaltyName}
                </div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', marginBottom: '6px' }}>
                  {entry.type === 1
                    ? `${entry.rewardItems[0]?.freeQty || 0} مجاناً / Free`
                    : `${entry.discountPercent}% خصم / ${entry.discountPercent}% Off`
                  }
                </div>
                {entry.rewardItems.map((ri, riIdx) => (
                  <div key={riIdx} style={{
                    display: 'flex', justifyContent: 'space-between', fontSize: '11px',
                    color: 'rgba(255,255,255,0.8)', padding: '2px 0',
                  }}>
                    <span>{ri.name}</span>
                    <span>{entry.type === 1 ? '$0.00' : `-$${ri.discountAmount.toFixed(2)}`}</span>
                  </div>
                ))}
                <div style={{
                  display: 'flex', justifyContent: 'space-between', fontSize: '11px',
                  fontWeight: 'bold', color: '#fff', borderTop: '1px solid rgba(255,255,255,0.15)',
                  marginTop: '4px', paddingTop: '4px',
                }}>
                  <span>Subtotal</span>
                  <span>-${entry.totalDiscount.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={styles.details}>
          <div style={styles.detailRow}>
            <span>Subtotal</span>
            <span>${order.subtotal?.toFixed(2) || '0.00'}</span>
          </div>
          {order.discountAmount > 0 && (
            <div style={{ ...styles.detailRow, color: '#fff' }}>
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
            <span style={{ color: '#e94560' }}>${order.totalAmount?.toFixed(2) || '0.00'}</span>
          </div>
        </div>

        <button style={styles.button} onClick={onClose}
          onMouseEnter={(e) => e.target.style.transform = 'scale(1.02)'}
          onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}>
          New Transaction
        </button>

        <button style={styles.printButton} onClick={handlePrint}
          onMouseEnter={(e) => e.target.style.transform = 'scale(1.02)'}
          onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}>
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
