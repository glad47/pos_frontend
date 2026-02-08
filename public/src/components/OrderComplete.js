import React, { useEffect } from 'react';
import printReceipt from './receiptPrinter';

const styles = {
  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal: { background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', borderRadius: '20px', padding: '30px', maxWidth: '450px', width: '90%', border: '1px solid rgba(255,255,255,0.2)', textAlign: 'center', maxHeight: '85vh', overflowY: 'auto' },
  successIcon: { width: '70px', height: '70px', background: 'linear-gradient(135deg, #28a745, #20c997)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px', fontSize: '35px' },
  title: { fontSize: '22px', fontWeight: 'bold', marginBottom: '8px', color: '#28a745' },
  orderNumber: { fontSize: '16px', color: 'rgba(255,255,255,0.8)', marginBottom: '20px' },
  orderNumberValue: { fontWeight: 'bold', color: '#e94560' },
  details: { background: 'rgba(255,255,255,0.05)', borderRadius: '15px', padding: '15px', marginBottom: '20px' },
  detailRow: { display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' },
  totalRow: { display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 'bold', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.2)', marginTop: '8px' },
  paymentMethod: { display: 'inline-block', background: 'rgba(233,69,96,0.2)', color: '#e94560', padding: '5px 15px', borderRadius: '20px', marginBottom: '15px' },
  button: { width: '100%', padding: '14px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px', background: 'linear-gradient(90deg, #e94560, #ff6b6b)', color: '#fff', marginBottom: '8px' },
  printButton: { width: '100%', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.3)', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px', background: 'transparent', color: '#fff' },
  timestamp: { fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginTop: '12px' },
};

const fc = (a) => `${a.toFixed(2)} ﷼`;
const fcNeg = (a) => `-${a.toFixed(2)} ﷼`;

const OrderComplete = ({ order, onClose, companyInfo }) => {
  useEffect(() => {
    if (order) setTimeout(() => handlePrint(), 500);
    // eslint-disable-next-line
  }, [order]);

  if (!order) return null;

  const formatDate = (ds) => new Date(ds).toLocaleString();

  const handlePrint = () => {
    printReceipt(order, { companyName: 'كيو', vat: '312001752300003', configName: 'Main POS', address: 'شارع الأمير محمد بن عبدالعزيز', city: 'جدة', country: 'Saudi Arabia', ...companyInfo });
  };

  const loyaltySections = order.loyaltySections || [];
  const remainingItems = order.remainingItems || [];

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        <div style={styles.successIcon}>✓</div>
        <div style={styles.title}>Payment Successful!</div>
        <div style={styles.orderNumber}>Order: <span style={styles.orderNumberValue}>{order.orderNumber}</span></div>
        <div style={styles.paymentMethod}>{order.paymentMethod}</div>

        {loyaltySections.length > 0 && (
          <div style={{ marginBottom: '15px', textAlign: 'left' }}>
            {loyaltySections.map((sec, idx) => (
              <div key={idx} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '10px 12px', marginBottom: '8px', borderLeft: '3px solid rgba(255,255,255,0.3)' }}>
                <div style={{ fontWeight: 'bold', fontSize: '12px', color: '#fff', marginBottom: '3px' }}>{sec.loyaltyName}</div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', marginBottom: '6px' }}>
                  {sec.type === 1 ? `Buy ${sec.triggerItems[0]?.quantity || 0} Get ${sec.rewardItems[0]?.freeQty || 0} Free` : `${sec.discountPercent}% Off`}
                </div>
                {sec.triggerItems.map((ti, i) => (
                  <div key={`t${i}`} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'rgba(255,255,255,0.8)', padding: '1px 0' }}>
                    <span>{ti.name} x {ti.quantity}</span><span>{fc(ti.lineTotal)}</span>
                  </div>
                ))}
                {sec.rewardItems.map((ri, i) => (
                  <div key={`r${i}`} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'rgba(255,255,255,0.8)', padding: '1px 0' }}>
                    <span>{ri.name} x {ri.quantity}</span><span>{sec.type === 1 ? fc(0) : fc(ri.lineTotal)}</span>
                  </div>
                ))}
                {sec.type === 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'rgba(255,255,255,0.8)', padding: '1px 0' }}>
                    <span>Discount ({sec.discountPercent}%)</span><span>{fcNeg(sec.totalDiscount)}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 'bold', color: '#fff', borderTop: '1px solid rgba(255,255,255,0.15)', marginTop: '4px', paddingTop: '4px' }}>
                  <span>Subtotal</span><span>{fc(sec.sectionSubtotal)}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {remainingItems.length > 0 && (
          <div style={{ marginBottom: '15px', textAlign: 'left' }}>
            {loyaltySections.length > 0 && <div style={{ fontWeight: 'bold', fontSize: '12px', color: 'rgba(255,255,255,0.7)', marginBottom: '6px' }}>Other Items</div>}
            {remainingItems.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'rgba(255,255,255,0.8)', padding: '2px 0' }}>
                <span>{item.name} x {item.quantity}</span><span>{fc(item.itemSubtotal)}</span>
              </div>
            ))}
          </div>
        )}

        <div style={styles.details}>
          <div style={styles.detailRow}><span>Subtotal</span><span>{fc(order.subtotal || 0)}</span></div>
          {order.discountAmount > 0 && <div style={{ ...styles.detailRow, color: '#fff' }}><span>Discount</span><span>{fcNeg(order.discountAmount)}</span></div>}
          <div style={styles.detailRow}><span>Tax</span><span>{fc(order.taxAmount || 0)}</span></div>
          <div style={styles.totalRow}><span>Total Paid</span><span style={{ color: '#e94560' }}>{fc(order.totalAmount || 0)}</span></div>
        </div>

        <button style={styles.button} onClick={onClose}>New Transaction</button>
        <button style={styles.printButton} onClick={handlePrint}>Print Receipt Again</button>
        <div style={styles.timestamp}>{order.createdAt ? formatDate(order.createdAt) : 'Just now'}</div>
      </div>
    </div>
  );
};

export default OrderComplete;
