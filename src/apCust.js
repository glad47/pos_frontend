import React, { useState, useEffect, useCallback, useRef } from 'react';
import { productApi, loyaltyApi, sessionApi, orderApi } from './services/api';
import OrderComplete from './components/OrderComplete';
import ReturnPOS from './components/ReturnPOS';

const styles = {
  app: { minHeight: '100vh', background: '#f5f7fa', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", color: '#333' },
  header: { background: '#fff', padding: '15px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e0e0e0', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' },
  logo: { fontSize: '24px', fontWeight: 'bold', color: '#2563eb' },
  sessionInfo: { display: 'flex', alignItems: 'center', gap: '15px' },
  badge: { background: '#2563eb', color: '#fff', padding: '5px 15px', borderRadius: '20px', fontSize: '12px' },
  badgeWarning: { background: '#ffc107', color: '#000', padding: '5px 15px', borderRadius: '20px', fontSize: '12px' },
  main: { padding: '20px', maxWidth: '1600px', margin: '0 auto' },
  posTypeSelector: { display: 'flex', gap: '15px', marginBottom: '20px', justifyContent: 'center' },
  posTypeTab: { padding: '15px 40px', borderRadius: '12px', border: '2px solid #e0e0e0', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', background: '#fff', color: '#666', transition: 'all 0.3s', boxShadow: '0 2px 6px rgba(0,0,0,0.08)' },
  posTypeTabActive: { background: '#2563eb', color: '#fff', borderColor: '#2563eb', transform: 'translateY(-2px)', boxShadow: '0 4px 12px rgba(37,99,235,0.3)' },
  posLayout: { display: 'grid', gridTemplateColumns: '1fr 450px', gap: '20px' },
  tabs: { display: 'flex', gap: '10px', marginBottom: '20px' },
  tab: { padding: '12px 25px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', background: '#fff', color: '#666', transition: 'all 0.3s', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  tabActive: { background: '#2563eb', color: '#fff' },
  panel: { background: '#fff', borderRadius: '15px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  input: { width: '100%', padding: '15px', borderRadius: '10px', border: '2px solid #e0e0e0', background: '#fff', color: '#333', fontSize: '16px', outline: 'none', marginBottom: '15px', boxSizing: 'border-box' },
  button: { padding: '12px 25px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.3s' },
  primaryBtn: { background: '#2563eb', color: '#fff' },
  dangerBtn: { background: '#dc3545', color: '#fff' },
  successBtn: { background: '#28a745', color: '#fff' },
  productGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '15px', marginTop: '15px' },
  productCard: { background: '#fff', borderRadius: '12px', padding: '15px', cursor: 'pointer', transition: 'all 0.2s', border: '2px solid #e0e0e0', textAlign: 'center' },
  qtyBtn: { width: '30px', height: '30px', borderRadius: '50%', border: 'none', background: '#2563eb', color: '#fff', cursor: 'pointer', fontWeight: 'bold' },
  modal: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modalContent: { background: '#fff', borderRadius: '20px', padding: '30px', maxWidth: '500px', width: '90%', boxShadow: '0 10px 40px rgba(0,0,0,0.3)' },
  toast: { position: 'fixed', bottom: '30px', left: '50%', transform: 'translateX(-50%)', padding: '15px 30px', borderRadius: '10px', background: '#333', color: '#fff', fontWeight: 'bold', zIndex: 2000 },
  refreshBtn: { padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#28a745', color: '#fff', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' },
  infoBox: { background: '#fff3cd', border: '2px solid #ffc107', borderRadius: '10px', padding: '15px', marginBottom: '15px', fontSize: '14px' },
  
  // Cart Component Styles
  cart: {
    background: '#fff',
    borderRadius: '15px',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    height: 'fit-content',
  },
  cartTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    marginBottom: '20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    color: '#333',
  },
  itemCount: {
    background: '#2563eb',
    padding: '4px 12px',
    borderRadius: '15px',
    fontSize: '12px',
    color: '#fff',
  },
  emptyCart: {
    textAlign: 'center',
    padding: '60px 20px',
    color: '#999',
  },
  cartItem: {
    background: '#f8f9fa',
    borderRadius: '10px',
    padding: '15px',
    marginBottom: '12px',
    border: '1px solid #e0e0e0',
    transition: 'all 0.2s',
  },
  itemHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '10px',
  },
  itemName: {
    fontWeight: 'bold',
    fontSize: '15px',
    color: '#333',
  },
  itemPrice: {
    color: '#2563eb',
    fontWeight: 'bold',
    fontSize: '16px',
  },
  itemDetails: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quantityControl: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  quantity: {
    minWidth: '30px',
    textAlign: 'center',
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#333',
  },
  removeBtn: {
    background: 'transparent',
    border: 'none',
    color: '#dc3545',
    cursor: 'pointer',
    fontSize: '12px',
    padding: '5px 10px',
    fontWeight: 'bold',
  },
  promoTag: {
    display: 'inline-block',
    background: '#d4edda',
    color: '#155724',
    padding: '4px 10px',
    borderRadius: '5px',
    fontSize: '11px',
    marginTop: '8px',
    marginRight: '5px',
    fontWeight: 'bold',
  },
  freeTag: {
    display: 'inline-block',
    background: '#d1ecf1',
    color: '#0c5460',
    padding: '4px 10px',
    borderRadius: '5px',
    fontSize: '11px',
    marginTop: '8px',
    marginRight: '5px',
    fontWeight: 'bold',
  },
  summary: {
    borderTop: '2px solid #e0e0e0',
    paddingTop: '20px',
    marginTop: '20px',
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '12px',
    fontSize: '15px',
    color: '#333',
  },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#2563eb',
    paddingTop: '15px',
    borderTop: '2px solid #2563eb',
    marginTop: '10px',
  },
  checkoutBtn: {
    width: '100%',
    padding: '15px',
    borderRadius: '10px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '16px',
    background: '#2563eb',
    color: '#fff',
    marginTop: '20px',
    transition: 'all 0.3s',
  },
  disabledBtn: {
    background: '#ccc',
    cursor: 'not-allowed',
    opacity: 0.6,
  },
  discountText: {
    color: '#28a745',
    fontWeight: 'bold',
  },
};

const categoryEmojis = { Beverages: '☕', Bakery: '🥐', Food: '🥪', Snacks: '🍪', default: '📦' };

// Format currency with ﷼ (Saudi Riyal)
const fc = (amount) => `${amount.toFixed(2)} ﷼`;
const fcNeg = (amount) => `-${amount.toFixed(2)} ﷼`;

// Cart Component
const Cart = ({ items, totals, onUpdateQuantity, onRemoveItem, onCheckout, loading, hasUnresolvedConflicts }) => {
  const { subtotal, totalDiscount, totalTax, total, sections, remainingItems } = totals;

  // Build item details with promotion info
  const buildItemDetails = () => {
    return items.map(item => {
      const promos = [];
      let itemDiscount = 0;

      sections.forEach(sec => {
        // Check if it's a trigger item
        sec.triggerItems.forEach(ti => {
          if (ti.barcode === item.barcode) {
            promos.push({
              name: sec.loyaltyName,
              type: sec.type === 1 ? 'BOGO' : 'DISCOUNT',
            });
          }
        });

        // Check if it's a reward item
        sec.rewardItems.forEach(ri => {
          if (ri.barcode === item.barcode) {
            promos.push({
              name: sec.loyaltyName,
              type: sec.type === 1 ? 'BOGO' : 'DISCOUNT',
              freeItems: ri.freeQty,
            });
            itemDiscount += ri.discountAmount;
          }
        });
      });

      return {
        ...item,
        itemSubtotal: item.price * item.quantity,
        itemDiscount,
        promos,
      };
    });
  };

  const itemDetails = buildItemDetails();

  return (
    <div style={styles.cart}>
      <div style={styles.cartTitle}>
        <span>🛒 Shopping Cart</span>
        {items.length > 0 && <span style={styles.itemCount}>{items.length} items</span>}
      </div>

      {items.length === 0 ? (
        <div style={styles.emptyCart}>
          <div style={{ fontSize: '64px', marginBottom: '15px' }}>🛒</div>
          <p style={{ fontSize: '16px', marginBottom: '5px', fontWeight: 'bold' }}>Cart is empty</p>
          <p style={{ fontSize: '13px', color: '#bbb' }}>Scan a barcode or click a product to add</p>
        </div>
      ) : (
        <>
          <div style={{ maxHeight: '420px', overflowY: 'auto', marginBottom: '20px' }}>
            {itemDetails.map((item) => (
              <div
                key={item.barcode}
                style={styles.cartItem}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#e3f2fd';
                  e.currentTarget.style.borderColor = '#2563eb';
                  e.currentTarget.style.transform = 'translateX(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#f8f9fa';
                  e.currentTarget.style.borderColor = '#e0e0e0';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                <div style={styles.itemHeader}>
                  <div style={{ flex: 1 }}>
                    <div style={styles.itemName}>{item.name}</div>
                    <div style={{ fontSize: '12px', color: '#666', marginTop: '3px' }}>
                      {fc(item.price)} each
                    </div>
                  </div>
                  <div style={styles.itemPrice}>{fc(item.itemSubtotal)}</div>
                </div>

                <div style={styles.itemDetails}>
                  <div style={styles.quantityControl}>
                    <button
                      style={styles.qtyBtn}
                      onClick={() => onUpdateQuantity(item.barcode, -1)}
                      onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
                      onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                    >
                      −
                    </button>
                    <span style={styles.quantity}>{item.quantity}</span>
                    <button
                      style={styles.qtyBtn}
                      onClick={() => onUpdateQuantity(item.barcode, 1)}
                      onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
                      onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                    >
                      +
                    </button>
                  </div>
                  <button
                    style={styles.removeBtn}
                    onClick={() => onRemoveItem(item.barcode)}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#a71d2a')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#dc3545')}
                  >
                    ✕ Remove
                  </button>
                </div>

                {/* Promotions applied */}
                {item.promos && item.promos.length > 0 && (
                  <div>
                    {item.promos.map((promo, idx) => (
                      <span key={idx} style={promo.type === 'BOGO' ? styles.freeTag : styles.promoTag}>
                        {promo.type === 'BOGO'
                          ? `🎁 ${promo.freeItems || 0} FREE`
                          : `💰 ${promo.name}`}
                      </span>
                    ))}
                  </div>
                )}

                {/* Item discount */}
                {item.itemDiscount > 0 && (
                  <div style={{ fontSize: '12px', color: '#28a745', marginTop: '8px', fontWeight: 'bold' }}>
                    💚 You save: {fc(item.itemDiscount)}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Active Promotions Summary */}
          {sections.length > 0 && (
            <div style={{ 
              marginBottom: '15px', 
              background: 'linear-gradient(135deg, #f0fff4 0%, #d4edda 100%)', 
              padding: '15px', 
              borderRadius: '10px', 
              border: '2px solid #28a745' 
            }}>
              <h4 style={{ fontSize: '14px', color: '#155724', marginBottom: '10px', fontWeight: 'bold' }}>
                🎁 Active Promotions
              </h4>
              {sections.map((sec, idx) => (
                <div key={idx} style={{ fontSize: '12px', marginBottom: '6px', color: '#155724' }}>
                  <strong>✓ {sec.loyaltyName}</strong>
                  <div style={{ marginLeft: '15px', marginTop: '2px' }}>
                    {sec.type === 1 ? (
                      <>FREE items! 🎉</>
                    ) : (
                      <>{sec.discountPercent}% discount</>
                    )}
                    {' • '}Save {fc(sec.totalDiscount)}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Summary */}
          <div style={styles.summary}>
            <div style={styles.summaryRow}>
              <span>Subtotal</span>
              <span style={{ fontWeight: 'bold' }}>{fc(subtotal)}</span>
            </div>

            {totalDiscount > 0 && (
              <div style={{ ...styles.summaryRow, ...styles.discountText }}>
                <span>💚 Total Discount</span>
                <span>{fcNeg(totalDiscount)}</span>
              </div>
            )}

            <div style={{ ...styles.summaryRow, color: '#666' }}>
              <span>Tax (15%)</span>
              <span style={{ fontWeight: 'bold' }}>{fc(totalTax)}</span>
            </div>

            <div style={styles.totalRow}>
              <span>Grand Total</span>
              <span>{fc(total)}</span>
            </div>
          </div>

          <button
            style={{
              ...styles.checkoutBtn,
              ...(loading || hasUnresolvedConflicts ? styles.disabledBtn : {}),
            }}
            onClick={onCheckout}
            disabled={loading || items.length === 0 || hasUnresolvedConflicts}
            onMouseEnter={(e) => {
              if (!loading && !hasUnresolvedConflicts) {
                e.currentTarget.style.background = '#1d4ed8';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(37,99,235,0.4)';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading && !hasUnresolvedConflicts) {
                e.currentTarget.style.background = '#2563eb';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }
            }}
          >
            {loading ? '⏳ Processing...' : hasUnresolvedConflicts ? '⚠️ Select Promotions First' : '✓ Proceed to Checkout'}
          </button>
        </>
      )}
    </div>
  );
};

function App() {
  const [session, setSession] = useState(null);
  const [cashierName, setCashierName] = useState('');
  const [openingCash, setOpeningCash] = useState('');
  const [isExistingSession, setIsExistingSession] = useState(false);
  const [posType, setPosType] = useState('sale');
  const [barcode, setBarcode] = useState('');
  const [cart, setCart] = useState([]);
  const [activeTab, setActiveTab] = useState('pos');
  const [products, setProducts] = useState([]);
  const [loyalties, setLoyalties] = useState([]);
  const [showPayment, setShowPayment] = useState(false);
  const [showCustomerInfo, setShowCustomerInfo] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({ name: '', phone: '', vat: '' });
  const [completedOrder, setCompletedOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [loyaltySelections, setLoyaltySelections] = useState({});
  const [showConflictModal, setShowConflictModal] = useState(null);
  const [customerDisplayWindow, setCustomerDisplayWindow] = useState(null);
  const selectionsRef = useRef({});
  selectionsRef.current = loyaltySelections;

  const companyInfo = { 
    companyName: 'كيو', 
    companyNameEn: 'Q', 
    vat: '312001752300003', 
    configName: 'Main POS', 
    address: 'شارع الأمير محمد بن عبدالعزيز', 
    neighborhood: 'حي الصفا', 
    buildingNumber: '4291', 
    plotId: '9418', 
    postalCode: '23251', 
    city: 'جدة', 
    region: 'مكه', 
    country: 'Saudi Arabia' 
  };

  const loadData = useCallback(async () => {
    try {
      const [prodRes, loyRes] = await Promise.all([productApi.getAll(), loyaltyApi.getActive()]);
      setProducts(prodRes.data);
      setLoyalties(loyRes.data);
      showMessage('Data refreshed successfully');
    } catch (error) { 
      console.error('Error loading data:', error);
      showMessage('Error loading data');
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

//   useEffect(() => {
//   updateCustomerDisplay();
// }, [cart, totals, customerDisplayWindow]);

  useEffect(() => {
    if (customerDisplayWindow && !customerDisplayWindow.closed) {
      updateCustomerDisplay();
    }
  }, [cart, loyaltySelections]);

  const showMessage = (msg) => { setMessage(msg); setTimeout(() => setMessage(''), 3000); };

  const handleOpenSession = async () => {
    if (!cashierName.trim()) { 
      showMessage('Please enter your name'); 
      return; 
    }
    
    try { 
      setLoading(true); 
      
      const response = await sessionApi.open({ 
        cashierName: cashierName.trim(), 
        openingCash: parseFloat(openingCash) || 0 
      }); 
      
      const isExisting = response.data.isExistingSession || false;
      const sessionData = response.data.session || response.data;
      
      setSession(sessionData); 
      setIsExistingSession(isExisting);
      
      if (isExisting) {
        showMessage('✓ Continuing your existing session');
      } else {
        showMessage('✓ New session opened successfully');
      }
    }
    catch (e) { 
      console.error('Session error:', e);
      showMessage('Error opening session'); 
    } 
    finally { 
      setLoading(false); 
    }
  };

  const handleCloseSession = async () => {
    if (!session) return;
    if (customerDisplayWindow && !customerDisplayWindow.closed) {
      customerDisplayWindow.close();
    }
    try { 
      setLoading(true); 
      await sessionApi.close(session.id, { closingCash: 0, notes: '' }); 
      setSession(null); 
      setCart([]); 
      setCashierName(''); 
      setOpeningCash(''); 
      setLoyaltySelections({});
      setCustomerInfo({ name: '', phone: '', vat: '' });
      setIsExistingSession(false);
      showMessage('Session closed successfully');
    }
    catch (e) { 
      showMessage('Error closing session'); 
    } 
    finally { 
      setLoading(false); 
    }
  };

  const handleRefreshData = async () => {
    setLoading(true);
    await loadData();
    setLoading(false);
  };

 // =============================================================================
// UPDATED openCustomerDisplay FUNCTION
// Replace your existing openCustomerDisplay function with this
// =============================================================================

const openCustomerDisplay = () => {
  if (customerDisplayWindow && !customerDisplayWindow.closed) {
    customerDisplayWindow.focus();
    return;
  }

  const display = window.open('', 'CustomerDisplay', 'width=900,height=700');
  if (display) {
    display.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Customer Display - ${companyInfo.companyNameEn}</title>
        <meta charset="UTF-8">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            min-height: 100vh;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 40px;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            color: #fff;
          }
          .header { text-align: center; margin-bottom: 40px; }
          .logo { font-size: 56px; font-weight: bold; margin-bottom: 10px; text-shadow: 3px 3px 6px rgba(0,0,0,0.4); }
          .subtitle { font-size: 24px; opacity: 0.95; font-weight: 500; }
          .cart-panel { 
            background: #fff; 
            border-radius: 20px; 
            padding: 40px; 
            max-width: 900px; 
            margin: 0 auto; 
            box-shadow: 0 15px 50px rgba(0,0,0,0.4); 
            color: #333; 
            min-height: 500px;
          }
          .bill-container { max-height: 600px; overflow-y: auto; padding-right: 10px; }
          
          /* Loyalty Section Styles */
          .loyalty-section { margin-bottom: 15px; padding-bottom: 12px; border-bottom: 1px dashed #bbb; }
          .loyalty-name { font-weight: bold; font-size: 18px; color: #333; margin-bottom: 6px; }
          .loyalty-description { font-size: 15px; color: #555; margin-bottom: 8px; }
          .line-item { display: flex; justify-content: space-between; padding: 4px 12px; font-size: 16px; color: #333; }
          .discount-line { display: flex; justify-content: space-between; padding: 4px 12px; font-size: 16px; color: #333; }
          .section-subtotal { 
            display: flex; 
            justify-content: space-between; 
            padding: 6px 12px; 
            font-size: 16px; 
            font-weight: bold; 
            color: #333; 
            border-top: 1px solid #ddd; 
            margin-top: 5px; 
          }
          .other-items-header { font-weight: bold; font-size: 18px; color: #333; margin-bottom: 6px; }
          
          /* Totals Section */
          .totals-section { border-top: 2px solid #333; padding-top: 15px; margin-top: 15px; }
          .total-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 20px; }
          .grand-total { 
            display: flex; 
            justify-content: space-between; 
            font-size: 28px; 
            font-weight: bold; 
            color: #2563eb; 
            padding-top: 12px; 
            border-top: 2px solid #333; 
            margin-top: 8px; 
          }
          
          /* Empty Cart */
          .empty-cart { text-align: center; padding: 80px 20px; font-size: 26px; color: #999; }
          .footer { 
            text-align: center; 
            margin-top: 40px; 
            font-size: 20px; 
            opacity: 0.95; 
            text-shadow: 1px 1px 2px rgba(0,0,0,0.3); 
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">🏪 ${companyInfo.companyNameEn}</div>
          <div class="subtitle">شاشة العميل / Customer Display</div>
        </div>
        <div class="cart-panel" id="cartContent">
          <div class="empty-cart">
            <div style="font-size: 80px; margin-bottom: 20px">🛒</div>
            <div style="margin-bottom: 10px">أهلاً بك</div>
            <div>Welcome!</div>
          </div>
        </div>
        <div class="footer">شكراً لتسوقك معنا 🙏 Thank you for shopping with us!</div>
        
        <script>
          window.addEventListener('message', function(event) {
            if (event.data && event.data.type === 'UPDATE_CART') {
              updateDisplay(event.data.data);
            }
          });
          
          function updateDisplay(data) {
            const fc = (amount) => amount.toFixed(2) + ' ﷼';
            const fcNeg = (amount) => '-' + amount.toFixed(2) + ' ﷼';
            const container = document.getElementById('cartContent');
            
            if (!data.cart || data.cart.length === 0) {
              container.innerHTML = '<div class="empty-cart"><div style="font-size: 80px; margin-bottom: 20px">🛒</div><div style="margin-bottom: 10px">أهلاً بك</div><div>Welcome!</div></div>';
              return;
            }
            
            let html = '<div class="bill-container">';
            
            // Loyalty Sections
            if (data.sections && data.sections.length > 0) {
              data.sections.forEach(sec => {
                html += '<div class="loyalty-section">';
                
                // Loyalty Program Name
                html += '<div class="loyalty-name">' + sec.loyaltyName + '</div>';
                
                // Loyalty Description
                if (sec.type === 1) {
                  const triggerQty = sec.triggerItems[0]?.quantity || 0;
                  const freeQty = sec.rewardItems[0]?.freeQty || 0;
                  html += '<div class="loyalty-description">Buy ' + triggerQty + ' Get ' + freeQty + ' Free / اشتر واحصل مجاناً</div>';
                } else {
                  html += '<div class="loyalty-description">' + sec.discountPercent + '% Off / ' + sec.discountPercent + '% خصم</div>';
                }
                
                // Trigger Items
                if (sec.triggerItems) {
                  sec.triggerItems.forEach(ti => {
                    html += '<div class="line-item"><span>' + ti.name + ' x ' + ti.quantity + '</span><span>' + fc(ti.lineTotal) + '</span></div>';
                  });
                }
                
                // Reward Items
                if (sec.rewardItems) {
                  sec.rewardItems.forEach(ri => {
                    const priceDisplay = sec.type === 1 ? fc(0) : fc(ri.lineTotal);
                    html += '<div class="line-item"><span>' + ri.name + ' x ' + ri.quantity + '</span><span>' + priceDisplay + '</span></div>';
                  });
                }
                
                // Discount Line (only for type 0)
                if (sec.type === 0) {
                  html += '<div class="discount-line"><span>Discount (' + sec.discountPercent + '%)</span><span>' + fcNeg(sec.totalDiscount) + '</span></div>';
                }
                
                // Section Subtotal
                html += '<div class="section-subtotal"><span>Subtotal</span><span>' + fc(sec.sectionSubtotal) + '</span></div>';
                html += '</div>';
              });
            }
            
            // Remaining Items (Other Items)
            if (data.remainingItems && data.remainingItems.length > 0) {
              html += '<div class="loyalty-section">';
              
              // Only show "Other Items" header if there are loyalty sections
              if (data.sections && data.sections.length > 0) {
                html += '<div class="other-items-header">Other Items</div>';
              }
              
              data.remainingItems.forEach(item => {
                html += '<div class="line-item"><span>' + item.name + ' x ' + item.quantity + '</span><span>' + fc(item.itemSubtotal) + '</span></div>';
              });
              
              html += '</div>';
            }
            
            html += '</div>'; // End bill-container
            
            // Final Totals Section
            html += '<div class="totals-section">';
            html += '<div class="total-row"><span>Subtotal</span><span>' + fc(data.subtotal) + '</span></div>';
            
            if (data.discount > 0) {
              html += '<div class="total-row"><span>Discount</span><span>' + fcNeg(data.discount) + '</span></div>';
            }
            
            html += '<div class="total-row"><span>Tax</span><span>' + fc(data.tax) + '</span></div>';
            html += '<div class="grand-total"><span>Total</span><span>' + fc(data.total) + '</span></div>';
            html += '</div>';
            
            container.innerHTML = html;
          }
          
          // Notify parent window that display is ready
          if (window.opener) {
            window.opener.postMessage({ type: 'DISPLAY_READY' }, '*');
          }
        </script>
      </body>
      </html>
    `);
    display.document.close();
    
    setCustomerDisplayWindow(display);
    updateCustomerDisplay();
    showMessage('Customer display opened');
  } else {
    showMessage('Please allow popups for customer display');
  }
};


// =============================================================================
// UPDATED updateCustomerDisplay FUNCTION
// Add/Update this function to send the proper data structure
// =============================================================================

const updateCustomerDisplay = () => {
  if (customerDisplayWindow && !customerDisplayWindow.closed) {
    const displayData = {
      cart: cart.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        total: item.price * item.quantity
      })),
      sections: totals.sections || [],
      remainingItems: totals.remainingItems || [],
      subtotal: totals.subtotal || 0,
      discount: totals.totalDiscount || 0,
      tax: totals.totalTax || 0,
      total: totals.total || 0,
      companyName: companyInfo.companyNameEn || 'Q POS'
    };

    customerDisplayWindow.postMessage({
      type: 'UPDATE_CART',
      data: displayData
    }, '*');
  }
};


// =============================================================================
// HOOK TO UPDATE DISPLAY WHEN CART CHANGES
// Add this useEffect if you don't have it already
// =============================================================================



  const handleAddByBarcode = async () => {
    if (!barcode.trim()) return;
    try { const r = await productApi.getByBarcode(barcode.trim()); addToCart(r.data); setBarcode(''); }
    catch (e) { showMessage('Product not found'); }
  };

  const addToCart = (product) => {
    setCart(prev => {
      const ex = prev.find(i => i.barcode === product.barcode);
      if (ex) return prev.map(i => i.barcode === product.barcode ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (bcode, delta) => {
    setCart(prev => prev.map(i => i.barcode === bcode ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i).filter(i => i.quantity > 0));
  };

  const removeFromCart = (bcode) => { setCart(prev => prev.filter(i => i.barcode !== bcode)); };

  const detectConflicts = useCallback((cartItems) => {
    const cartMap = {};
    cartItems.forEach(item => { cartMap[item.barcode] = item; });
    const triggerGroups = {};

    loyalties.forEach(loyalty => {
      if (!loyalty.active || loyalty.type !== 1) return;
      const triggerBarcodes = (loyalty.triggerProductIds || '').split(',').map(s => s.trim()).filter(Boolean);
      const rewardBarcodes = (loyalty.rewardProductIds || '').split(',').map(s => s.trim()).filter(Boolean);
      if (!triggerBarcodes.length || !rewardBarcodes.length) return;
      const minQty = loyalty.minQuantity || 1;

      let activeTrigger = null;
      for (const tb of triggerBarcodes) {
        if (cartMap[tb] && cartMap[tb].quantity >= minQty) { activeTrigger = tb; break; }
      }
      if (!activeTrigger) return;

      const rewardsInCart = rewardBarcodes.filter(rb => cartMap[rb] && cartMap[rb].quantity > 0);
      if (rewardsInCart.length === 0) return;
      if (!triggerGroups[activeTrigger]) triggerGroups[activeTrigger] = [];
      triggerGroups[activeTrigger].push({ loyalty, triggerBarcode: activeTrigger, rewardsInCart });
    });

    const conflicts = [];
    Object.keys(triggerGroups).forEach(triggerBarcode => {
      const programs = triggerGroups[triggerBarcode];
      if (programs.length > 1) {
        const triggerProduct = cartMap[triggerBarcode];
        const options = programs.map(p => {
          const rewardQtyPerSet = p.loyalty.rewardQuantity || 1;
          const potentialSavings = p.rewardsInCart.reduce((sum, rb) => sum + (cartMap[rb].price * rewardQtyPerSet), 0);
          return {
            loyaltyId: p.loyalty.id || p.loyalty.name, loyaltyName: p.loyalty.name, type: p.loyalty.type, discountPercent: 0,
            rewardProducts: p.rewardsInCart.map(rb => ({ barcode: rb, name: cartMap[rb].name, price: cartMap[rb].price })),
            potentialSavings: potentialSavings
          };
        });
        conflicts.push({ conflictKey: triggerBarcode, triggerProduct: triggerProduct.name, triggerBarcode: triggerBarcode, options: options });
      }
    });
    return conflicts;
  }, [loyalties]);

  useEffect(() => {
    if (cart.length === 0) { setLoyaltySelections({}); setShowConflictModal(null); return; }
    const conflicts = detectConflicts(cart);
    const currentSel = selectionsRef.current;
    const activeKeys = new Set(conflicts.map(c => c.conflictKey));
    const cleaned = {};
    Object.keys(currentSel).forEach(key => { if (activeKeys.has(key)) cleaned[key] = currentSel[key]; });

    for (const c of conflicts) {
      const sel = cleaned[c.conflictKey];
      if (sel) {
        const selectedOption = c.options.find(opt => opt.loyaltyId === sel);
        if (!selectedOption) delete cleaned[c.conflictKey];
      }
    }
    setLoyaltySelections(cleaned);

    for (const c of conflicts) {
      const sel = cleaned[c.conflictKey];
      if (!sel) { setShowConflictModal(c); return; }
    }
    setShowConflictModal(null);
  }, [cart, detectConflicts]);

  const handleConflictSelect = (conflictKey, selectedLoyaltyId) => {
    const newSel = { ...selectionsRef.current, [conflictKey]: selectedLoyaltyId };
    setLoyaltySelections(newSel);
    selectionsRef.current = newSel;
    setShowConflictModal(null);
    const conflicts = detectConflicts(cart);
    for (const c of conflicts) {
      if (!newSel[c.conflictKey]) { setTimeout(() => setShowConflictModal(c), 100); return; }
    }
    showMessage('Promotion selected!');
  };

  const hasUnresolvedConflicts = () => {
    const conflicts = detectConflicts(cart);
    for (const c of conflicts) {
      const sel = selectionsRef.current[c.conflictKey];
      if (!sel) return true;
    }
    return false;
  };

  const calculateLoyaltyBreakdown = useCallback((cartItems) => {
    const cartMap = {};
    cartItems.forEach(item => { cartMap[item.barcode] = { ...item }; });
    const bogoRewardedBarcodes = new Set();
    const currentSel = selectionsRef.current;

    const activeLoyalties = loyalties.filter(loyalty => {
      if (!loyalty.active) return false;
      const triggerBarcodes = (loyalty.triggerProductIds || '').split(',').map(s => s.trim()).filter(Boolean);
      for (const tb of triggerBarcodes) {
        if (currentSel[tb]) {
          const loyaltyId = loyalty.id || loyalty.name;
          return currentSel[tb] === loyaltyId;
        }
      }
      return true;
    });

    const sorted = [...activeLoyalties].sort((a, b) => (b.type || 0) - (a.type || 0));
    const sections = [];
    const consumedTrigger = {};
    const consumedReward = {};

    sorted.forEach(loyalty => {
      const triggerBarcodes = (loyalty.triggerProductIds || '').split(',').map(s => s.trim()).filter(Boolean);
      const rewardBarcodes = (loyalty.rewardProductIds || '').split(',').map(s => s.trim()).filter(Boolean);
      if (!triggerBarcodes.length || !rewardBarcodes.length) return;

      const minQty = loyalty.minQuantity || 1;
      const maxQty = loyalty.maxQuantity || 0;

      let triggerBarcode = null, triggerAvailable = 0;
      for (const tb of triggerBarcodes) {
        const item = cartMap[tb];
        if (!item) continue;
        const avail = item.quantity - (consumedTrigger[tb] || 0);
        if (avail >= minQty) { triggerBarcode = tb; triggerAvailable = avail; break; }
      }
      if (!triggerBarcode) return;

      const triggerItem = cartMap[triggerBarcode];

      if (loyalty.type === 1) {
        const rewardQtyPerSet = loyalty.rewardQuantity || 1;
        for (const rb of rewardBarcodes) {
          const rewardItem = cartMap[rb];
          if (!rewardItem) continue;
          const availReward = rewardItem.quantity - (consumedReward[rb] || 0);
          if (availReward <= 0) continue;
          const maxSetsFromTrigger = Math.floor(triggerAvailable / minQty);
          const maxSetsFromReward = Math.floor(availReward / rewardQtyPerSet);
          let maxPossibleSets = Math.min(maxSetsFromTrigger, maxSetsFromReward);
          let actualSets = maxQty === 0 ? maxPossibleSets : Math.min(maxPossibleSets, maxQty);
          if (actualSets <= 0) continue;
          const freeQty = actualSets * rewardQtyPerSet;
          const triggerQtyUsed = actualSets * minQty;
          bogoRewardedBarcodes.add(rb);
          sections.push({
            loyaltyId: loyalty.id || loyalty.name, loyaltyName: loyalty.name, type: 1, discountPercent: 0,
            triggerItems: [{ barcode: triggerBarcode, name: triggerItem.name, price: triggerItem.price, quantity: triggerQtyUsed, lineTotal: triggerItem.price * triggerQtyUsed }],
            rewardItems: [{ barcode: rb, name: rewardItem.name, price: rewardItem.price, quantity: freeQty, freeQty, discountAmount: freeQty * rewardItem.price, lineTotal: 0 }],
            sectionSubtotal: triggerItem.price * triggerQtyUsed, totalDiscount: freeQty * rewardItem.price
          });
          consumedTrigger[triggerBarcode] = (consumedTrigger[triggerBarcode] || 0) + triggerQtyUsed;
          consumedReward[rb] = (consumedReward[rb] || 0) + freeQty;
          break;
        }
      } else if (loyalty.type === 0) {
        const pct = parseFloat(loyalty.discountPercent) || 0;
        const rewardQtyPerSet = loyalty.rewardQuantity || 1;
        for (const rb of rewardBarcodes) {
          if (bogoRewardedBarcodes.has(rb)) continue;
          const rewardItem = cartMap[rb];
          if (!rewardItem) continue;
          const availReward = rewardItem.quantity - (consumedReward[rb] || 0);
          if (availReward <= 0) continue;
          const maxSetsFromTrigger = Math.floor(triggerAvailable / minQty);
          const maxSetsFromReward = Math.floor(availReward / rewardQtyPerSet);
          let maxPossibleSets = Math.min(maxSetsFromTrigger, maxSetsFromReward);
          let actualSets = maxQty === 0 ? maxPossibleSets : Math.min(maxPossibleSets, maxQty);
          if (actualSets <= 0) continue;
          const rewardQty = actualSets * rewardQtyPerSet;
          const triggerQtyUsed = actualSets * minQty;
          const discountAmt = (rewardItem.price * rewardQty * pct) / 100;
          sections.push({
            loyaltyId: loyalty.id || loyalty.name, loyaltyName: loyalty.name, type: 0, discountPercent: pct,
            triggerItems: [{ barcode: triggerBarcode, name: triggerItem.name, price: triggerItem.price, quantity: triggerQtyUsed, lineTotal: triggerItem.price * triggerQtyUsed }],
            rewardItems: [{ barcode: rb, name: rewardItem.name, price: rewardItem.price, quantity: rewardQty, freeQty: 0, discountAmount: discountAmt, lineTotal: rewardItem.price * rewardQty }],
            sectionSubtotal: (triggerItem.price * triggerQtyUsed) + (rewardItem.price * rewardQty) - discountAmt, totalDiscount: discountAmt
          });
          consumedTrigger[triggerBarcode] = (consumedTrigger[triggerBarcode] || 0) + triggerQtyUsed;
          consumedReward[rb] = (consumedReward[rb] || 0) + rewardQty;
        }
      }
    });

    const remainingItems = [];
    cartItems.forEach(item => {
      const usedT = consumedTrigger[item.barcode] || 0;
      const usedR = consumedReward[item.barcode] || 0;
      const remaining = item.quantity - Math.min(item.quantity, usedT + usedR);
      if (remaining > 0) remainingItems.push({ ...item, quantity: remaining, itemSubtotal: item.price * remaining });
    });

    return { sections, remainingItems };
  }, [loyalties]);

  const calculateTotals = useCallback(() => {
    const { sections, remainingItems } = calculateLoyaltyBreakdown(cart);
    let subtotal = 0, totalDiscount = 0;
    sections.forEach(sec => {
      sec.triggerItems.forEach(ti => { subtotal += ti.lineTotal; });
      sec.rewardItems.forEach(ri => { subtotal += ri.price * ri.quantity; });
      totalDiscount += sec.totalDiscount;
    });
    remainingItems.forEach(item => { subtotal += item.itemSubtotal; });

    let totalTax = 0;
    const cartMap = {};
    cart.forEach(item => { cartMap[item.barcode] = item; });
    const barcodeNet = {};
    sections.forEach(sec => {
      sec.triggerItems.forEach(ti => { barcodeNet[ti.barcode] = (barcodeNet[ti.barcode] || 0) + ti.lineTotal; });
      sec.rewardItems.forEach(ri => { barcodeNet[ri.barcode] = (barcodeNet[ri.barcode] || 0) + (ri.price * ri.quantity - ri.discountAmount); });
    });
    remainingItems.forEach(item => { barcodeNet[item.barcode] = (barcodeNet[item.barcode] || 0) + item.itemSubtotal; });
    Object.keys(barcodeNet).forEach(bc => { totalTax += Math.max(0, barcodeNet[bc]) * (cartMap[bc]?.taxRate || 0); });

    return { subtotal, totalTax, totalDiscount, total: subtotal - totalDiscount + totalTax, sections, remainingItems };
  }, [cart, calculateLoyaltyBreakdown]);

  const totals = calculateTotals();

  const handleCheckout = () => {
    if (cart.length === 0) { showMessage('Cart is empty'); return; }
    if (hasUnresolvedConflicts()) { showMessage('Please select promotions first'); return; }
    setShowCustomerInfo(true);
  };

  const proceedToPayment = () => {
    if (customerInfo.vat && customerInfo.vat.trim() && !customerInfo.name) { showMessage('Customer name required for VAT invoice'); return; }
    setShowCustomerInfo(false); setShowPayment(true);
  };

  const handlePayment = async (method) => {
    if (cart.length === 0 || hasUnresolvedConflicts()) return;
    try {
      setLoading(true);
      const itemsWithPromotions = cart.map(cartItem => {
        const { sections } = calculateLoyaltyBreakdown(cart);
        let promotionName = null, isReward = false, discount = 0;
        sections.forEach(sec => {
          sec.triggerItems.forEach(ti => { if (ti.barcode === cartItem.barcode) promotionName = sec.loyaltyName; });
          sec.rewardItems.forEach(ri => {
            if (ri.barcode === cartItem.barcode) { promotionName = sec.loyaltyName; isReward = ri.freeQty > 0; discount = ri.discountAmount; }
          });
        });
        return { barcode: cartItem.barcode, quantity: cartItem.quantity, price: cartItem.price, discount, promotionName, isReward };
      });

      const orderDTO = {
        items: itemsWithPromotions, paymentMethod: method, notes: '',
        customerName: customerInfo.name || null, customerPhone: customerInfo.phone || null, customerVat: customerInfo.vat || null,
        orderType: posType.toUpperCase()
      };

      const response = await orderApi.create(session.id, orderDTO);
      setCompletedOrder({
        ...response.data,
        items: cart.map(i => ({ name: i.name, price: i.price, quantity: i.quantity, barcode: i.barcode })),
        loyaltySections: totals.sections, remainingItems: totals.remainingItems,
        subtotal: totals.subtotal, taxAmount: totals.totalTax, totalAmount: totals.total, discountAmount: totals.totalDiscount,
        paymentMethod: method, cashierName: session.cashierName, createdAt: new Date().toISOString(), amountPaid: totals.total, change: 0
      });
      setCart([]); setLoyaltySelections({}); setCustomerInfo({ name: '', phone: '', vat: '' }); setShowPayment(false);
      showMessage('Order completed successfully!');
    } catch (error) { console.error('Payment error:', error); showMessage('Error processing payment'); }
    finally { setLoading(false); }
  };

  const handleFileImport = async (type, file) => { showMessage(`Importing ${type}...`); };

  if (!session) {
    return (
      <div style={styles.app}>
        <header style={styles.header}><div style={styles.logo}>🏪 {companyInfo.companyNameEn} POS</div></header>
        <main style={styles.main}>
          <div style={{ maxWidth: '400px', margin: '50px auto' }}>
            <div style={styles.panel}>
              <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>Open Session</h2>
              <div style={styles.infoBox}><strong>ℹ️ Note:</strong> If you already have an open session, you'll continue with it automatically.</div>
              <input type="text" placeholder="Cashier Name" value={cashierName} onChange={e => setCashierName(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && handleOpenSession()} style={styles.input} autoFocus />
              <input type="number" placeholder="Opening Cash (Optional)" value={openingCash} onChange={e => setOpeningCash(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && handleOpenSession()} style={styles.input} />
              <button onClick={handleOpenSession} disabled={loading} style={{ ...styles.button, ...styles.primaryBtn, width: '100%' }}>
                {loading ? 'Checking...' : 'Continue'}
              </button>
            </div>
          </div>
        </main>
        {message && <div style={styles.toast}>{message}</div>}
      </div>
    );
  }

  return (
    <div style={styles.app}>
      <header style={styles.header}>
        <div style={styles.logo}>🏪 {companyInfo.companyNameEn} POS</div>
        <div style={styles.sessionInfo}>
          <span style={styles.badge}>👤 {session.cashierName}</span>
          {isExistingSession && <span style={styles.badgeWarning}>🔄 Continuing Session</span>}
          <span style={styles.badge}>💰 {fc(session.totalSales)}</span>
          <button onClick={handleCloseSession} style={{ ...styles.button, ...styles.dangerBtn }}>Close Session</button>
        </div>
      </header>

      <main style={styles.main}>
        <div style={styles.posTypeSelector}>
          <div style={{ ...styles.posTypeTab, ...(posType === 'sale' ? styles.posTypeTabActive : {}) }} onClick={() => setPosType('sale')}>🛒 Sale POS</div>
          <div style={{ ...styles.posTypeTab, ...(posType === 'return' ? styles.posTypeTabActive : {}) }} onClick={() => setPosType('return')}>↩️ Return POS</div>
        </div>

        {posType === 'return' ? (
          <ReturnPOS session={session} companyInfo={companyInfo} showMessage={showMessage} />
        ) : (
          <>
            <div style={styles.tabs}>
              {['pos', 'products', 'import'].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} style={{ ...styles.tab, ...(activeTab === tab ? styles.tabActive : {}) }}>
                  {tab === 'pos' ? '🛒 POS' : tab === 'products' ? '📦 Products' : '📤 Import'}
                </button>
              ))}
              <button onClick={handleRefreshData} style={styles.refreshBtn} disabled={loading}>🔄 Refresh Data</button>
              <button onClick={openCustomerDisplay} style={{ ...styles.button, ...styles.successBtn }}>🖥️ Customer Display</button>
            </div>

             {activeTab === 'pos' && (
          <div style={styles.posLayout}>
            <div style={styles.panel}>
              <input style={styles.input} placeholder="Scan barcode or enter product code..." value={barcode} onChange={e => setBarcode(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleAddByBarcode()} autoFocus />
              <div style={styles.productGrid}>
                {products.map(product => (
                  <div key={product.barcode} style={styles.productCard} onClick={() => addToCart(product)}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#2563eb'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#e0e0e0'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                    <div style={{ fontSize: '32px', marginBottom: '8px' }}>{categoryEmojis[product.category] || categoryEmojis.default}</div>
                    <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '5px' }}>{product.name}</div>
                    <div style={{ color: '#2563eb', fontWeight: 'bold' }}>{fc(product.price)}</div>
                    <div style={{ fontSize: '10px', color: '#999', marginTop: '5px' }}>#{product.barcode}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={styles.panel}>
              <h3 style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between' }}>
                <span>Shopping Cart</span>
                {cart.length > 0 && <span style={{ ...styles.badge, background: '#2563eb' }}>{cart.length} items</span>}
              </h3>

              {cart.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}><p>Cart is empty</p></div>
              ) : (
                <>
                  <div style={{ maxHeight: '450px', overflowY: 'auto' }}>
                    <div style={{ marginBottom: '10px', padding: '8px', background: '#f0f4ff', borderRadius: '8px', fontSize: '12px' }}>
                      {cart.map(item => (
                        <div key={item.barcode} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0', borderBottom: '1px solid #e8ecf0' }}>
                          <span style={{ fontWeight: 'bold', flex: 1 }}>{item.name}</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <button style={{ ...styles.qtyBtn, width: '24px', height: '24px', fontSize: '14px' }} onClick={() => updateQuantity(item.barcode, -1)}>−</button>
                            <span style={{ minWidth: '20px', textAlign: 'center', fontWeight: 'bold' }}>{item.quantity}</span>
                            <button style={{ ...styles.qtyBtn, width: '24px', height: '24px', fontSize: '14px' }} onClick={() => updateQuantity(item.barcode, 1)}>+</button>
                            <button style={{ background: 'transparent', border: 'none', color: '#dc3545', cursor: 'pointer', fontSize: '11px', padding: '2px 5px' }} onClick={() => removeFromCart(item.barcode)}>Remove</button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {hasUnresolvedConflicts() && (
                      <div style={{ 
                        background: 'rgba(255, 193, 7, 0.2)', 
                        border: '2px solid #ffc107', 
                        borderRadius: '10px', 
                        padding: '12px', 
                        marginBottom: '10px',
                        textAlign: 'center'
                      }}>
                        <div style={{ fontWeight: 'bold', color: '#856404', marginBottom: '5px' }}>⚠️ Action Required</div>
                        <div style={{ fontSize: '12px', color: '#856404' }}>Multiple FREE item promotions - please select one</div>
                      </div>
                    )}

                    <div style={{ borderTop: '2px solid #333', paddingTop: '8px' }}>
                      {totals.sections.map((sec, idx) => (
                        <div key={idx} style={{ marginBottom: '10px', paddingBottom: '8px', borderBottom: '1px dashed #bbb' }}>
                          <div style={{ fontWeight: 'bold', fontSize: '13px', color: '#333', marginBottom: '4px' }}>{sec.loyaltyName}</div>
                          <div style={{ fontSize: '11px', color: '#555', marginBottom: '5px' }}>
                            {sec.type === 1 ? `Buy ${sec.triggerItems[0]?.quantity || 0} Get ${sec.rewardItems[0]?.freeQty || 0} Free / اشتر واحصل مجاناً` : `${sec.discountPercent}% Off / ${sec.discountPercent}% خصم`}
                          </div>
                          {sec.triggerItems.map((ti, i) => (
                            <div key={`t${i}`} style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 8px', fontSize: '12px', color: '#333' }}>
                              <span>{ti.name} x {ti.quantity}</span><span>{fc(ti.lineTotal)}</span>
                            </div>
                          ))}
                          {sec.rewardItems.map((ri, i) => (
                            <div key={`r${i}`} style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 8px', fontSize: '12px', color: '#333' }}>
                              <span>{ri.name} x {ri.quantity}</span><span>{sec.type === 1 ? fc(0) : fc(ri.lineTotal)}</span>
                            </div>
                          ))}
                          {sec.type === 0 && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 8px', fontSize: '12px', color: '#333' }}>
                              <span>Discount ({sec.discountPercent}%)</span><span>{fcNeg(sec.totalDiscount)}</span>
                            </div>
                          )}
                          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 8px', fontSize: '12px', fontWeight: 'bold', color: '#333', borderTop: '1px solid #ddd', marginTop: '3px' }}>
                            <span>Subtotal</span><span>{fc(sec.sectionSubtotal)}</span>
                          </div>
                        </div>
                      ))}

                      {totals.remainingItems.length > 0 && (
                        <div style={{ marginBottom: '10px', paddingBottom: '8px', borderBottom: '1px dashed #bbb' }}>
                          {totals.sections.length > 0 && <div style={{ fontWeight: 'bold', fontSize: '13px', color: '#333', marginBottom: '4px' }}>Other Items</div>}
                          {totals.remainingItems.map((item, idx) => (
                            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 8px', fontSize: '12px', color: '#333' }}>
                              <span>{item.name} x {item.quantity}</span><span>{fc(item.itemSubtotal)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ borderTop: '2px solid #333', paddingTop: '10px', marginTop: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '14px' }}>
                      <span>Subtotal</span><span>{fc(totals.subtotal)}</span>
                    </div>
                    {totals.totalDiscount > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '14px', color: '#333' }}>
                        <span>Discount</span><span>{fcNeg(totals.totalDiscount)}</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '14px', color: '#666' }}>
                      <span>Tax</span><span>{fc(totals.totalTax)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '20px', fontWeight: 'bold', color: '#2563eb', paddingTop: '8px', borderTop: '2px solid #333' }}>
                      <span>Total</span><span>{fc(totals.total)}</span>
                    </div>
                  </div>

                  <button
                    style={{ 
                      ...styles.button, 
                      ...styles.primaryBtn, 
                      width: '100%', 
                      marginTop: '15px', 
                      padding: '15px', 
                      fontSize: '16px', 
                      ...(hasUnresolvedConflicts() ? { background: '#ffc107', color: '#000' } : {}) 
                    }}
                    onClick={() => {
                      if (hasUnresolvedConflicts()) { 
                        const c = detectConflicts(cart); 
                        for (const x of c) { 
                          if (!selectionsRef.current[x.conflictKey]) { 
                            setShowConflictModal(x); 
                            return; 
                          } 
                        } 
                      }
                      else setShowPayment(true);
                    }} 
                    disabled={loading}>
                    {hasUnresolvedConflicts() ? '⚠️ Select FREE Item First' : 'Proceed to Payment'}
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div style={styles.panel}>
            <h3 style={{ marginBottom: '20px' }}>Products ({products.length})</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr style={{ background: '#f8f9fa' }}>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e0e0e0' }}>Barcode</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e0e0e0' }}>Name</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e0e0e0' }}>Category</th>
                <th style={{ padding: '12px', textAlign: 'right', borderBottom: '2px solid #e0e0e0' }}>Price</th>
                <th style={{ padding: '12px', textAlign: 'right', borderBottom: '2px solid #e0e0e0' }}>Tax</th>
              </tr></thead>
              <tbody>{products.map(p => (
                <tr key={p.barcode} style={{ borderBottom: '1px solid #e0e0e0' }}>
                  <td style={{ padding: '12px' }}><code style={{ background: '#f0f0f0', padding: '3px 8px', borderRadius: '4px' }}>{p.barcode}</code></td>
                  <td style={{ padding: '12px' }}>{p.name}</td>
                  <td style={{ padding: '12px' }}><span style={{ background: '#e0e7ff', color: '#2563eb', padding: '3px 10px', borderRadius: '15px', fontSize: '12px' }}>{p.category}</span></td>
                  <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold', color: '#2563eb' }}>{fc(p.price)}</td>
                  <td style={{ padding: '12px', textAlign: 'right', color: '#666' }}>{((p.taxRate || 0) * 100).toFixed(0)}%</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}

        {activeTab === 'import' && (
          <div style={styles.panel}>
            <h3 style={{ marginBottom: '20px' }}>Import Data from Excel</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              {[{ type: 'products', label: 'Import Products' }, { type: 'loyalty', label: 'Import Loyalty Programs' }].map(({ type, label }) => (
                <div key={type} style={{ padding: '30px', border: '2px dashed #e0e0e0', borderRadius: '15px', textAlign: 'center' }}>
                  <h4>{label}</h4>
                  <p style={{ color: '#666', marginBottom: '15px' }}>Upload Excel file (.xlsx)</p>
                  <input type="file" accept=".xlsx,.xls" onChange={e => e.target.files[0] && handleFileImport(type, e.target.files[0])} style={{ display: 'none' }} id={`${type}File`} />
                  <label htmlFor={`${type}File`} style={{ ...styles.button, ...styles.primaryBtn, cursor: 'pointer', display: 'inline-block' }}>Select File</label>
                </div>
              ))}
            </div>
          </div>
        )}
          </>
        )}
      </main>

      {showCustomerInfo && (
        <div style={styles.modal} onClick={() => setShowCustomerInfo(false)}>
          <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Customer Information</h2>
            <p style={{ textAlign: 'center', color: '#666', fontSize: '14px', marginBottom: '20px' }}>Optional - Required for Tax Invoice with VAT</p>
            <input type="text" placeholder="Customer Name" value={customerInfo.name} onChange={e => setCustomerInfo({ ...customerInfo, name: e.target.value })} style={styles.input} />
            <input type="tel" placeholder="Phone Number" value={customerInfo.phone} onChange={e => setCustomerInfo({ ...customerInfo, phone: e.target.value })} style={styles.input} />
            <input type="text" placeholder="VAT Number (للفاتورة الضريبية)" value={customerInfo.vat} onChange={e => setCustomerInfo({ ...customerInfo, vat: e.target.value })} style={styles.input} />
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => { setCustomerInfo({ name: '', phone: '', vat: '' }); setShowCustomerInfo(false); setShowPayment(true); }}
                style={{ ...styles.button, flex: 1, background: '#6c757d', color: '#fff' }}>Skip</button>
              <button onClick={proceedToPayment} style={{ ...styles.button, ...styles.primaryBtn, flex: 1 }}>Continue</button>
            </div>
          </div>
        </div>
      )}

      {showPayment && (
        <div style={styles.modal} onClick={() => setShowPayment(false)}>
          <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <h2 style={{ textAlign: 'center', marginBottom: '10px' }}>Complete Payment</h2>
            <div style={{ textAlign: 'center', fontSize: '36px', fontWeight: 'bold', color: '#2563eb', marginBottom: '25px' }}>{fc(totals.total)}</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
              <button style={{ padding: '25px', borderRadius: '15px', border: '2px solid #e0e0e0', background: '#fff', cursor: 'pointer', fontSize: '18px', fontWeight: 'bold' }}
                onClick={() => handlePayment('CASH')} disabled={loading}>💵 Cash</button>
              <button style={{ padding: '25px', borderRadius: '15px', border: '2px solid #e0e0e0', background: '#fff', cursor: 'pointer', fontSize: '18px', fontWeight: 'bold' }}
                onClick={() => handlePayment('CARD')} disabled={loading}>💳 Card</button>
            </div>
            <button style={{ width: '100%', padding: '15px', borderRadius: '10px', border: '1px solid #e0e0e0', background: '#fff', cursor: 'pointer' }}
              onClick={() => setShowPayment(false)}>Cancel</button>
          </div>
        </div>
      )}

      {showConflictModal && (
        <div style={styles.modal}>
          <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <h3 style={{ textAlign: 'center', marginBottom: '10px', color: '#333', fontSize: '22px' }}>🎁 Choose FREE Item</h3>
            <p style={{ textAlign: 'center', color: '#666', marginBottom: '8px', fontSize: '14px' }}>
              Multiple FREE item promotions for <strong>{showConflictModal.triggerProduct}</strong>
            </p>
            <p style={{ textAlign: 'center', color: '#999', marginBottom: '20px', fontSize: '12px' }}>اختر المنتج المجاني / Select which item to get FREE:</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '15px' }}>
              {showConflictModal.options.map(opt => (
                <button key={opt.loyaltyId}
                  style={{ padding: '18px 20px', borderRadius: '12px', border: '2px solid #e0e0e0', background: '#fff', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#28a745'; e.currentTarget.style.background = '#f0fff4'; e.currentTarget.style.transform = 'translateX(-3px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#e0e0e0'; e.currentTarget.style.background = '#fff'; e.currentTarget.style.transform = 'translateX(0)'; }}
                  onClick={() => handleConflictSelect(showConflictModal.conflictKey, opt.loyaltyId)}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 'bold', fontSize: '15px', color: '#333', marginBottom: '4px' }}>🎁 {opt.loyaltyName}</div>
                      <div style={{ fontSize: '13px', color: '#28a745', marginBottom: '6px', fontWeight: 'bold' }}>Get FREE: {opt.rewardProducts.map(rp => rp.name).join(', ')}</div>
                      <div style={{ fontSize: '12px', color: '#888' }}>Value: {opt.rewardProducts.map(rp => fc(rp.price)).join(', ')}</div>
                    </div>
                    <div style={{ textAlign: 'right', marginLeft: '15px' }}>
                      <div style={{ fontSize: '11px', color: '#888', marginBottom: '3px' }}>You Save</div>
                      <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#28a745' }}>{fc(opt.potentialSavings)}</div>
                    </div>
                  </div>
                  <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px dashed #e0e0e0', textAlign: 'center', fontSize: '13px', fontWeight: 'bold', color: '#28a745' }}>
                    ← Click to Select / اضغط للاختيار
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {completedOrder && <OrderComplete order={completedOrder} onClose={() => setCompletedOrder(null)} companyInfo={companyInfo} />}
      {message && <div style={styles.toast}>{message}</div>}
    </div>
  );
}

export default App;