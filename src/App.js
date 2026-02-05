import React, { useState, useEffect, useCallback } from 'react';
import { productApi, loyaltyApi, sessionApi, orderApi } from './services/api';
import OrderComplete from './components/OrderComplete';

const styles = {
  app: {
    minHeight: '100vh',
    background: '#f5f7fa',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    color: '#333',
  },
  header: {
    background: '#fff',
    padding: '15px 30px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #e0e0e0',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
  },
  logo: { fontSize: '24px', fontWeight: 'bold', color: '#2563eb' },
  sessionInfo: { display: 'flex', alignItems: 'center', gap: '15px' },
  badge: { background: '#2563eb', color: '#fff', padding: '5px 15px', borderRadius: '20px', fontSize: '12px' },
  main: { padding: '20px', maxWidth: '1600px', margin: '0 auto' },
  posLayout: { display: 'grid', gridTemplateColumns: '1fr 400px', gap: '20px' },
  tabs: { display: 'flex', gap: '10px', marginBottom: '20px' },
  tab: {
    padding: '12px 25px', borderRadius: '10px', border: 'none', cursor: 'pointer',
    fontWeight: 'bold', fontSize: '14px', background: '#fff', color: '#666',
    transition: 'all 0.3s', boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  tabActive: { background: '#2563eb', color: '#fff' },
  panel: { background: '#fff', borderRadius: '15px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  input: {
    width: '100%', padding: '15px', borderRadius: '10px', border: '2px solid #e0e0e0',
    background: '#fff', color: '#333', fontSize: '16px', outline: 'none',
    marginBottom: '15px', boxSizing: 'border-box',
  },
  button: { padding: '12px 25px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.3s' },
  primaryBtn: { background: '#2563eb', color: '#fff' },
  dangerBtn: { background: '#dc3545', color: '#fff' },
  productGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '15px', marginTop: '15px' },
  productCard: {
    background: '#fff', borderRadius: '12px', padding: '15px', cursor: 'pointer',
    transition: 'all 0.2s', border: '2px solid #e0e0e0', textAlign: 'center',
  },
  cartItem: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '12px', background: '#f8f9fa', borderRadius: '10px', marginBottom: '10px',
  },
  qtyBtn: {
    width: '30px', height: '30px', borderRadius: '50%', border: 'none',
    background: '#2563eb', color: '#fff', cursor: 'pointer', fontWeight: 'bold',
  },
  modal: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center',
    justifyContent: 'center', zIndex: 1000,
  },
  modalContent: {
    background: '#fff', borderRadius: '20px', padding: '30px',
    maxWidth: '450px', width: '90%', boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
  },
  rewardTag: {
    background: '#22c55e', color: '#fff', padding: '3px 8px', borderRadius: '5px',
    fontSize: '11px', display: 'inline-block', marginTop: '4px',
  },
  discountTag: {
    background: '#f59e0b', color: '#fff', padding: '3px 8px', borderRadius: '5px',
    fontSize: '11px', display: 'inline-block', marginTop: '4px',
  },
  rewardLine: {
    padding: '8px 12px', background: '#f0fdf4', borderRadius: '8px', marginBottom: '6px',
    borderLeft: '3px solid #22c55e', fontSize: '13px',
  },
  toast: {
    position: 'fixed', bottom: '30px', left: '50%', transform: 'translateX(-50%)',
    padding: '15px 30px', borderRadius: '10px', background: '#333', color: '#fff',
    fontWeight: 'bold', zIndex: 2000,
  },
};

const categoryEmojis = { Beverages: '☕', Bakery: '🥐', Food: '🥪', Snacks: '🍪', default: '📦' };

function App() {
  const [session, setSession] = useState(null);
  const [cashierName, setCashierName] = useState('');
  const [openingCash, setOpeningCash] = useState('');
  const [barcode, setBarcode] = useState('');
  const [cart, setCart] = useState([]);
  const [activeTab, setActiveTab] = useState('pos');
  const [products, setProducts] = useState([]);
  const [loyalties, setLoyalties] = useState([]);
  const [showPayment, setShowPayment] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

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
      const [prodRes, loyRes] = await Promise.all([
        productApi.getAll(),
        loyaltyApi.getActive(),
      ]);
      setProducts(prodRes.data);
      setLoyalties(loyRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleOpenSession = async () => {
    if (!cashierName.trim()) { showMessage('Please enter your name'); return; }
    try {
      setLoading(true);
      const response = await sessionApi.open({
        cashierName: cashierName.trim(),
        openingCash: parseFloat(openingCash) || 0,
      });
      setSession(response.data);
    } catch (error) { showMessage('Error opening session'); }
    finally { setLoading(false); }
  };

  const handleCloseSession = async () => {
    if (!session) return;
    try {
      setLoading(true);
      await sessionApi.close(session.id, { closingCash: 0, notes: '' });
      setSession(null); setCart([]); setCashierName(''); setOpeningCash('');
    } catch (error) { showMessage('Error closing session'); }
    finally { setLoading(false); }
  };

  const handleAddByBarcode = async () => {
    if (!barcode.trim()) return;
    try {
      const response = await productApi.getByBarcode(barcode.trim());
      addToCart(response.data);
      setBarcode('');
    } catch (error) { showMessage('Product not found'); }
  };

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.barcode === product.barcode);
      if (existing) {
        return prev.map((item) =>
          item.barcode === product.barcode
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (barcode, delta) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.barcode === barcode
            ? { ...item, quantity: Math.max(0, item.quantity + delta) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (barcode) => {
    setCart((prev) => prev.filter((item) => item.barcode !== barcode));
  };

  // =========================================================
  // LOYALTY LOGIC: each loyalty program produces its own
  // separate section with individual discount amounts
  // =========================================================
  const calculateLoyaltyRewards = (cartItems) => {
    const cartMap = {};
    cartItems.forEach(item => { cartMap[item.barcode] = item; });

    // Each entry: { loyaltyName, type, discountPercent, rewardItems: [{ barcode, name, price, quantity, freeQty, discountAmount }] }
    const loyaltyBreakdown = [];

    loyalties.forEach(loyalty => {
      if (!loyalty.active) return;

      const triggerBarcodes = (loyalty.triggerProductIds || '')
        .split(',').map(s => s.trim()).filter(Boolean);
      const rewardBarcodes = (loyalty.rewardProductIds || '')
        .split(',').map(s => s.trim()).filter(Boolean);

      if (triggerBarcodes.length === 0 || rewardBarcodes.length === 0) return;

      let triggered = false;
      let triggerSets = Infinity;
      const minQty = loyalty.minQuantity || 1;

      for (const tb of triggerBarcodes) {
        const cartItem = cartMap[tb];
        if (cartItem && cartItem.quantity >= minQty) {
          triggered = true;
          const sets = Math.floor(cartItem.quantity / minQty);
          triggerSets = Math.min(triggerSets, sets);
        }
      }

      if (!triggered) return;

      const entry = {
        loyaltyName: loyalty.name,
        type: loyalty.type, // 0=DISCOUNT, 1=BUY_X_GET_Y
        discountPercent: parseFloat(loyalty.discountPercent) || 0,
        rewardItems: [],
        totalDiscount: 0,
      };

      for (const rb of rewardBarcodes) {
        const rewardItem = cartMap[rb];
        if (!rewardItem) continue;

        if (loyalty.type === 1) {
          const rewardQty = loyalty.rewardQuantity || 1;
          const freeQty = Math.min(triggerSets * rewardQty, rewardItem.quantity);
          const discountAmt = freeQty * rewardItem.price;
          entry.rewardItems.push({
            barcode: rb,
            name: rewardItem.name,
            price: rewardItem.price,
            quantity: rewardItem.quantity,
            freeQty,
            discountAmount: discountAmt,
          });
          entry.totalDiscount += discountAmt;
        } else if (loyalty.type === 0) {
          const pct = parseFloat(loyalty.discountPercent) || 0;
          const rewardQty = Math.min((loyalty.rewardQuantity || 1) * triggerSets, rewardItem.quantity);
          const discountableAmount = rewardItem.price * rewardQty;
          const discountAmt = (discountableAmount * pct) / 100;
          entry.rewardItems.push({
            barcode: rb,
            name: rewardItem.name,
            price: rewardItem.price,
            quantity: rewardQty,
            freeQty: 0,
            discountAmount: discountAmt,
          });
          entry.totalDiscount += discountAmt;
        }
      }

      if (entry.rewardItems.length > 0) {
        loyaltyBreakdown.push(entry);
      }
    });

    return loyaltyBreakdown;
  };

  const calculateTotals = () => {
    let subtotal = 0;
    let totalTax = 0;
    let totalDiscount = 0;
    let itemDetails = [];

    const loyaltyBreakdown = calculateLoyaltyRewards(cart);

    // Build per-barcode discount map from all loyalties (for tax calc)
    const perBarcodeDiscount = {};
    loyaltyBreakdown.forEach(entry => {
      entry.rewardItems.forEach(ri => {
        if (!perBarcodeDiscount[ri.barcode]) perBarcodeDiscount[ri.barcode] = 0;
        perBarcodeDiscount[ri.barcode] += ri.discountAmount;
      });
    });

    cart.forEach((item) => {
      const itemSubtotal = item.price * item.quantity;
      const itemDiscount = perBarcodeDiscount[item.barcode] || 0;
      const taxableAmount = Math.max(0, itemSubtotal - itemDiscount);
      const taxRate = item.taxRate || 0;
      const itemTax = taxableAmount * taxRate;

      subtotal += itemSubtotal;
      totalTax += itemTax;
      totalDiscount += itemDiscount;

      itemDetails.push({
        ...item,
        itemSubtotal,
        itemDiscount,
        itemTax,
      });
    });

    const total = subtotal - totalDiscount + totalTax;
    return { subtotal, totalTax, totalDiscount, total, itemDetails, loyaltyBreakdown };
  };

  const handlePayment = async (paymentMethod) => {
    if (cart.length === 0) return;
    try {
      setLoading(true);
      const response = await orderApi.create({
        sessionId: session.id,
        items: cart.map((item) => ({ barcode: item.barcode, quantity: item.quantity })),
        paymentMethod,
        cashierName: session.cashierName,
      });

      const totals = calculateTotals();

      const orderData = {
        orderNumber: response.data.orderNumber || response.data.id || `ORD-${Date.now()}`,
        items: totals.itemDetails.map(item => ({
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          discount: item.itemDiscount > 0 ? ((item.itemDiscount / item.itemSubtotal) * 100).toFixed(0) : 0,
          discountAmount: item.itemDiscount,
          barcode: item.barcode,
        })),
        loyaltyBreakdown: totals.loyaltyBreakdown,
        subtotal: totals.subtotal,
        taxAmount: totals.totalTax,
        totalAmount: totals.total,
        discountAmount: totals.totalDiscount,
        paymentMethod: paymentMethod,
        cashierName: session.cashierName,
        createdAt: new Date().toISOString(),
        amountPaid: totals.total,
        change: 0,
        customer: null,
      };

      setShowPayment(false);
      setCompletedOrder(orderData);
      setCart([]);
      showMessage('Order completed successfully!');
    } catch (error) {
      showMessage('Error processing order');
      console.error('Payment error:', error);
    } finally { setLoading(false); }
  };

  const handleFileImport = async (type, file) => {
    try {
      setLoading(true);
      if (type === 'products') { await productApi.import(file); }
      else if (type === 'loyalty') { await loyaltyApi.import(file); }
      await loadData();
      showMessage(`${type} imported successfully!`);
    } catch (error) { showMessage(`Error importing ${type}`); }
    finally { setLoading(false); }
  };

  const totals = calculateTotals();

  // Login screen
  if (!session) {
    return (
      <div style={styles.app}>
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <h2 style={{ textAlign: 'center', marginBottom: '10px', color: '#2563eb' }}>POS System</h2>
            <p style={{ textAlign: 'center', color: '#666', marginBottom: '30px' }}>Point of Sale Terminal</p>
            <h3 style={{ marginBottom: '20px', color: '#333' }}>Open New Session</h3>
            <input style={styles.input} placeholder="Enter your name" value={cashierName}
              onChange={(e) => setCashierName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleOpenSession()} />
            <input style={styles.input} placeholder="Opening cash (optional)" type="number" value={openingCash}
              onChange={(e) => setOpeningCash(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleOpenSession()} />
            <button style={{ ...styles.button, ...styles.primaryBtn, width: '100%', padding: '15px' }}
              onClick={handleOpenSession} disabled={loading}>
              {loading ? 'Opening...' : 'Start Session'}
            </button>
            {message && <p style={{ textAlign: 'center', marginTop: '15px', color: '#dc3545' }}>{message}</p>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.app}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.logo}>POS System</div>
        <div style={styles.sessionInfo}>
          <span>Cashier: <strong>{session.cashierName}</strong></span>
          <span style={styles.badge}>Session #{session.sessionNumber || session.id}</span>
          <button style={{ ...styles.button, ...styles.dangerBtn }} onClick={handleCloseSession}>Close Session</button>
        </div>
      </header>

      <main style={styles.main}>
        {/* Tabs */}
        <div style={styles.tabs}>
          {['pos', 'products', 'import'].map((tab) => (
            <button key={tab}
              style={{ ...styles.tab, ...(activeTab === tab ? styles.tabActive : {}) }}
              onClick={() => setActiveTab(tab)}>
              {tab === 'pos' ? '🛒 POS' : tab === 'products' ? '📦 Products' : '📥 Import'}
            </button>
          ))}
        </div>

        {activeTab === 'pos' && (
          <div style={styles.posLayout}>
            {/* Products Panel */}
            <div style={styles.panel}>
              <input style={styles.input}
                placeholder="🔍 Scan barcode or enter product code..."
                value={barcode} onChange={(e) => setBarcode(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddByBarcode()} autoFocus />
              <div style={styles.productGrid}>
                {products.map((product) => (
                  <div key={product.barcode} style={{ ...styles.productCard }}
                    onClick={() => addToCart(product)}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#2563eb'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e0e0e0'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                    <div style={{ fontSize: '32px', marginBottom: '8px' }}>{categoryEmojis[product.category] || categoryEmojis.default}</div>
                    <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '5px' }}>{product.name}</div>
                    <div style={{ color: '#2563eb', fontWeight: 'bold' }}>${product.price.toFixed(2)}</div>
                    <div style={{ fontSize: '10px', color: '#999', marginTop: '5px' }}>#{product.barcode}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cart Panel */}
            <div style={styles.panel}>
              <h3 style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between' }}>
                <span>Shopping Cart</span>
                {cart.length > 0 && <span style={{ ...styles.badge, background: '#2563eb' }}>{cart.length} items</span>}
              </h3>

              {cart.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                  <div style={{ fontSize: '48px', marginBottom: '15px' }}>🛒</div>
                  <p>Cart is empty</p>
                </div>
              ) : (
                <>
                  <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    {totals.itemDetails.map((item) => (
                      <div key={item.barcode}>
                        <div style={styles.cartItem}>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 'bold' }}>{item.name}</div>
                            <div style={{ fontSize: '12px', color: '#666' }}>
                              ${item.price.toFixed(2)} × {item.quantity}
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <button style={styles.qtyBtn} onClick={() => updateQuantity(item.barcode, -1)}>−</button>
                            <span style={{ minWidth: '25px', textAlign: 'center' }}>{item.quantity}</span>
                            <button style={styles.qtyBtn} onClick={() => updateQuantity(item.barcode, 1)}>+</button>
                          </div>
                          <div style={{ marginLeft: '15px', fontWeight: 'bold', color: '#2563eb' }}>
                            ${item.itemSubtotal.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Loyalty program sections — each separated */}
                    {totals.loyaltyBreakdown && totals.loyaltyBreakdown.map((entry, idx) => (
                      <div key={idx} style={{
                        borderTop: '1px dashed #ccc', marginTop: '10px', paddingTop: '10px',
                      }}>
                        <div style={{ fontWeight: 'bold', fontSize: '13px', color: '#333', marginBottom: '6px' }}>
                          {entry.loyaltyName}
                        </div>
                        <div style={{ fontSize: '12px', color: '#333', marginBottom: '4px' }}>
                          {entry.type === 1
                            ? `${entry.rewardItems[0]?.freeQty || 0} مجاناً / Free`
                            : `${entry.discountPercent}% خصم / ${entry.discountPercent}% Off`
                          }
                        </div>
                        {entry.rewardItems.map((ri, riIdx) => (
                          <div key={riIdx} style={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            padding: '4px 12px', fontSize: '12px', color: '#333',
                          }}>
                            <span>{ri.name}</span>
                            <span style={{ fontWeight: 'bold' }}>
                              {entry.type === 1
                                ? `$0.00`
                                : `-$${ri.discountAmount.toFixed(2)}`
                              }
                            </span>
                          </div>
                        ))}
                        <div style={{
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          padding: '4px 12px', fontSize: '12px', fontWeight: 'bold', color: '#333',
                          borderTop: '1px solid #e0e0e0', marginTop: '4px', paddingTop: '6px',
                        }}>
                          <span>Subtotal</span>
                          <span>-${entry.totalDiscount.toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Summary */}
                  <div style={{ borderTop: '2px solid #e0e0e0', paddingTop: '15px', marginTop: '15px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span>Subtotal</span>
                      <span>${totals.subtotal.toFixed(2)}</span>
                    </div>
                    {totals.totalDiscount > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: '#333' }}>
                        <span>Discount</span>
                        <span>-${totals.totalDiscount.toFixed(2)}</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: '#666' }}>
                      <span>Tax</span>
                      <span>${totals.totalTax.toFixed(2)}</span>
                    </div>
                    <div style={{
                      display: 'flex', justifyContent: 'space-between', fontSize: '22px',
                      fontWeight: 'bold', color: '#2563eb', paddingTop: '10px', borderTop: '2px solid #e0e0e0'
                    }}>
                      <span>Total</span>
                      <span>${totals.total.toFixed(2)}</span>
                    </div>
                  </div>

                  <button
                    style={{ ...styles.button, ...styles.primaryBtn, width: '100%', marginTop: '20px', padding: '15px', fontSize: '16px' }}
                    onClick={() => setShowPayment(true)} disabled={loading}>
                    Proceed to Payment
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
              <thead>
                <tr style={{ background: '#f8f9fa' }}>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e0e0e0' }}>Barcode</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e0e0e0' }}>Name</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e0e0e0' }}>Category</th>
                  <th style={{ padding: '12px', textAlign: 'right', borderBottom: '2px solid #e0e0e0' }}>Price</th>
                  <th style={{ padding: '12px', textAlign: 'right', borderBottom: '2px solid #e0e0e0' }}>Tax</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.barcode} style={{ borderBottom: '1px solid #e0e0e0' }}>
                    <td style={{ padding: '12px' }}><code style={{ background: '#f0f0f0', padding: '3px 8px', borderRadius: '4px' }}>{product.barcode}</code></td>
                    <td style={{ padding: '12px' }}>{product.name}</td>
                    <td style={{ padding: '12px' }}><span style={{ background: '#e0e7ff', color: '#2563eb', padding: '3px 10px', borderRadius: '15px', fontSize: '12px' }}>{product.category}</span></td>
                    <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold', color: '#2563eb' }}>${product.price.toFixed(2)}</td>
                    <td style={{ padding: '12px', textAlign: 'right', color: '#666' }}>{((product.taxRate || 0) * 100).toFixed(0)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'import' && (
          <div style={styles.panel}>
            <h3 style={{ marginBottom: '20px' }}>Import Data from Excel</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div style={{ padding: '30px', border: '2px dashed #e0e0e0', borderRadius: '15px', textAlign: 'center' }}>
                <div style={{ fontSize: '48px', marginBottom: '15px' }}>📦</div>
                <h4>Import Products</h4>
                <p style={{ color: '#666', marginBottom: '15px' }}>Upload Excel file (.xlsx)</p>
                <input type="file" accept=".xlsx,.xls"
                  onChange={(e) => e.target.files[0] && handleFileImport('products', e.target.files[0])}
                  style={{ display: 'none' }} id="productFile" />
                <label htmlFor="productFile" style={{ ...styles.button, ...styles.primaryBtn, cursor: 'pointer', display: 'inline-block' }}>Select File</label>
              </div>
              <div style={{ padding: '30px', border: '2px dashed #e0e0e0', borderRadius: '15px', textAlign: 'center' }}>
                <div style={{ fontSize: '48px', marginBottom: '15px' }}>🎁</div>
                <h4>Import Loyalty Programs</h4>
                <p style={{ color: '#666', marginBottom: '15px' }}>Upload Excel file (.xlsx)</p>
                <input type="file" accept=".xlsx,.xls"
                  onChange={(e) => e.target.files[0] && handleFileImport('loyalty', e.target.files[0])}
                  style={{ display: 'none' }} id="loyaltyFile" />
                <label htmlFor="loyaltyFile" style={{ ...styles.button, ...styles.primaryBtn, cursor: 'pointer', display: 'inline-block' }}>Select File</label>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Payment Modal */}
      {showPayment && (
        <div style={styles.modal} onClick={() => setShowPayment(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ textAlign: 'center', marginBottom: '10px' }}>Complete Payment</h2>
            <div style={{ textAlign: 'center', fontSize: '36px', fontWeight: 'bold', color: '#2563eb', marginBottom: '25px' }}>
              ${totals.total.toFixed(2)}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
              <button style={{ padding: '25px', borderRadius: '15px', border: '2px solid #e0e0e0', background: '#fff', cursor: 'pointer', fontSize: '16px' }}
                onClick={() => handlePayment('CASH')} disabled={loading}>
                <div style={{ fontSize: '40px', marginBottom: '10px' }}>💵</div>
                <strong>Cash</strong>
              </button>
              <button style={{ padding: '25px', borderRadius: '15px', border: '2px solid #e0e0e0', background: '#fff', cursor: 'pointer', fontSize: '16px' }}
                onClick={() => handlePayment('CARD')} disabled={loading}>
                <div style={{ fontSize: '40px', marginBottom: '10px' }}>💳</div>
                <strong>Card</strong>
              </button>
            </div>
            <button style={{ width: '100%', padding: '15px', borderRadius: '10px', border: '1px solid #e0e0e0', background: '#fff', cursor: 'pointer' }}
              onClick={() => setShowPayment(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Order Complete Modal */}
      {completedOrder && (
        <OrderComplete
          order={completedOrder}
          onClose={() => setCompletedOrder(null)}
          companyInfo={companyInfo}
        />
      )}

      {/* Toast */}
      {message && <div style={styles.toast}>{message}</div>}
    </div>
  );
}

export default App;
