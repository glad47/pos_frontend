import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';

const fc = (amount) => `${amount.toFixed(2)} ﷼`;
const fcNeg = (amount) => `-${amount.toFixed(2)} ﷼`;

const CustomerDisplay = () => {
  const [cartData, setCartData] = useState({
    cart: [],
    sections: [],
    remainingItems: [],
    subtotal: 0,
    discount: 0,
    tax: 0,
    total: 0,
    companyName: 'Q POS'
  });

  useEffect(() => {
    // Listen for messages from parent window
    const handleMessage = (event) => {
      if (event.data && event.data.type === 'UPDATE_CART') {
        setCartData(event.data.data);
      }
    };

    window.addEventListener('message', handleMessage);

    // Send ready message to parent
    if (window.opener) {
      window.opener.postMessage({ type: 'DISPLAY_READY' }, '*');
    }

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '40px',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      color: '#fff'
    },
    header: {
      textAlign: 'center',
      marginBottom: '40px'
    },
    logo: {
      fontSize: '56px',
      fontWeight: 'bold',
      marginBottom: '10px',
      textShadow: '3px 3px 6px rgba(0,0,0,0.4)'
    },
    subtitle: {
      fontSize: '24px',
      opacity: 0.95,
      fontWeight: '500'
    },
    cartPanel: {
      background: '#fff',
      borderRadius: '20px',
      padding: '40px',
      maxWidth: '900px',
      margin: '0 auto',
      boxShadow: '0 15px 50px rgba(0,0,0,0.4)',
      color: '#333'
    },
    billContainer: {
      maxHeight: '600px',
      overflowY: 'auto',
      paddingRight: '10px'
    },
    // Loyalty section styles (matching POS)
    loyaltySection: {
      marginBottom: '15px',
      paddingBottom: '12px',
      borderBottom: '1px dashed #bbb'
    },
    loyaltyName: {
      fontWeight: 'bold',
      fontSize: '18px',
      color: '#333',
      marginBottom: '6px'
    },
    loyaltyDescription: {
      fontSize: '15px',
      color: '#555',
      marginBottom: '8px'
    },
    lineItem: {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '4px 12px',
      fontSize: '16px',
      color: '#333'
    },
    discountLine: {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '4px 12px',
      fontSize: '16px',
      color: '#333'
    },
    sectionSubtotal: {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '6px 12px',
      fontSize: '16px',
      fontWeight: 'bold',
      color: '#333',
      borderTop: '1px solid #ddd',
      marginTop: '5px'
    },
    otherItemsHeader: {
      fontWeight: 'bold',
      fontSize: '18px',
      color: '#333',
      marginBottom: '6px'
    },
    totalsSection: {
      borderTop: '2px solid #333',
      paddingTop: '15px',
      marginTop: '15px'
    },
    totalRow: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '8px',
      fontSize: '20px'
    },
    grandTotal: {
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: '28px',
      fontWeight: 'bold',
      color: '#2563eb',
      paddingTop: '12px',
      borderTop: '2px solid #333',
      marginTop: '8px'
    },
    emptyCart: {
      textAlign: 'center',
      padding: '80px 20px',
      fontSize: '26px',
      color: '#999'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.logo}>كيو | {cartData.companyName}</div>
        <div style={styles.subtitle}>شاشة العميل / Customer Display</div>
      </div>

      <div style={styles.cartPanel}>
        {cartData.cart.length === 0 ? (
          <div style={styles.emptyCart}>
            <div style={{ fontSize: '80px', marginBottom: '20px' }}>🛒</div>
            <div style={{ marginBottom: '10px' }}>أهلاً بك</div>
            <div>Welcome!</div>
          </div>
        ) : (
          <>
            <div style={styles.billContainer}>
              {/* Loyalty Sections - Exact format from POS */}
              {cartData.sections && cartData.sections.map((sec, idx) => (
                <div key={idx} style={styles.loyaltySection}>
                  {/* Loyalty Program Name */}
                  <div style={styles.loyaltyName}>
                    {sec.loyaltyName}
                  </div>

                  {/* Loyalty Description */}
                  <div style={styles.loyaltyDescription}>
                    {sec.type === 1 
                      ? `Buy ${sec.triggerItems[0]?.quantity || 0} Get ${sec.rewardItems[0]?.freeQty || 0} Free / اشتر واحصل مجاناً`
                      : `${sec.discountPercent}% Off / ${sec.discountPercent}% خصم`
                    }
                  </div>

                  {/* Trigger Items */}
                  {sec.triggerItems && sec.triggerItems.map((ti, i) => (
                    <div key={`t${i}`} style={styles.lineItem}>
                      <span>{ti.name} x {ti.quantity}</span>
                      <span>{fc(ti.lineTotal)}</span>
                    </div>
                  ))}

                  {/* Reward Items */}
                  {sec.rewardItems && sec.rewardItems.map((ri, i) => (
                    <div key={`r${i}`} style={styles.lineItem}>
                      <span>{ri.name} x {ri.quantity}</span>
                      <span>{sec.type === 1 ? fc(0) : fc(ri.lineTotal)}</span>
                    </div>
                  ))}

                  {/* Discount Line (only for type 0 - percentage discount) */}
                  {sec.type === 0 && (
                    <div style={styles.discountLine}>
                      <span>Discount ({sec.discountPercent}%)</span>
                      <span>{fcNeg(sec.totalDiscount)}</span>
                    </div>
                  )}

                  {/* Section Subtotal */}
                  <div style={styles.sectionSubtotal}>
                    <span>Subtotal</span>
                    <span>{fc(sec.sectionSubtotal)}</span>
                  </div>
                </div>
              ))}

              {/* Other Items (Remaining Items not in any loyalty program) */}
              {cartData.remainingItems && cartData.remainingItems.length > 0 && (
                <div style={styles.loyaltySection}>
                  {/* Only show "Other Items" header if there are loyalty sections */}
                  {cartData.sections && cartData.sections.length > 0 && (
                    <div style={styles.otherItemsHeader}>
                      Other Items
                    </div>
                  )}

                  {/* Remaining Items */}
                  {cartData.remainingItems.map((item, idx) => (
                    <div key={idx} style={styles.lineItem}>
                      <span>{item.name} x {item.quantity}</span>
                      <span>{fc(item.itemSubtotal)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Final Totals Section */}
            <div style={styles.totalsSection}>
              <div style={styles.totalRow}>
                <span>Subtotal</span>
                <span>{fc(cartData.subtotal)}</span>
              </div>

              {cartData.discount > 0 && (
                <div style={styles.totalRow}>
                  <span>Discount</span>
                  <span>{fcNeg(cartData.discount)}</span>
                </div>
              )}

              <div style={styles.totalRow}>
                <span>Tax</span>
                <span>{fc(cartData.tax)}</span>
              </div>

              <div style={styles.grandTotal}>
                <span>Total</span>
                <span>{fc(cartData.total)}</span>
              </div>
            </div>
          </>
        )}
      </div>

      <div style={{ 
        textAlign: 'center', 
        marginTop: '40px', 
        fontSize: '20px', 
        opacity: 0.95,
        textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
      }}>
        شكراً لتسوقك معنا | Thank you for shopping with us!
      </div>
    </div>
  );
};

// If this window is opened as a popup, render the component
if (window.name === 'CustomerDisplay') {
  const root = document.getElementById('root') || document.createElement('div');
  if (!document.getElementById('root')) {
    root.id = 'root';
    document.body.appendChild(root);
  }
  
  const reactRoot = ReactDOM.createRoot(root);
  reactRoot.render(<CustomerDisplay />);
}

export default CustomerDisplay;