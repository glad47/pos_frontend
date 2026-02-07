import React, { useState, useEffect, useCallback, useRef } from 'react';
import { productApi, loyaltyApi, sessionApi, orderApi } from './services/api';
import OrderComplete from './components/OrderComplete';

const styles = {
  app: { minHeight: '100vh', background: '#f5f7fa', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", color: '#333' },
  header: { background: '#fff', padding: '15px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e0e0e0', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' },
  logo: { fontSize: '24px', fontWeight: 'bold', color: '#2563eb' },
  sessionInfo: { display: 'flex', alignItems: 'center', gap: '15px' },
  badge: { background: '#2563eb', color: '#fff', padding: '5px 15px', borderRadius: '20px', fontSize: '12px' },
  main: { padding: '20px', maxWidth: '1600px', margin: '0 auto' },
  posLayout: { display: 'grid', gridTemplateColumns: '1fr 400px', gap: '20px' },
  tabs: { display: 'flex', gap: '10px', marginBottom: '20px' },
  tab: { padding: '12px 25px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', background: '#fff', color: '#666', transition: 'all 0.3s', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  tabActive: { background: '#2563eb', color: '#fff' },
  panel: { background: '#fff', borderRadius: '15px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  input: { width: '100%', padding: '15px', borderRadius: '10px', border: '2px solid #e0e0e0', background: '#fff', color: '#333', fontSize: '16px', outline: 'none', marginBottom: '15px', boxSizing: 'border-box' },
  button: { padding: '12px 25px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.3s' },
  primaryBtn: { background: '#2563eb', color: '#fff' },
  dangerBtn: { background: '#dc3545', color: '#fff' },
  productGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '15px', marginTop: '15px' },
  productCard: { background: '#fff', borderRadius: '12px', padding: '15px', cursor: 'pointer', transition: 'all 0.2s', border: '2px solid #e0e0e0', textAlign: 'center' },
  qtyBtn: { width: '30px', height: '30px', borderRadius: '50%', border: 'none', background: '#2563eb', color: '#fff', cursor: 'pointer', fontWeight: 'bold' },
  modal: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modalContent: { background: '#fff', borderRadius: '20px', padding: '30px', maxWidth: '450px', width: '90%', boxShadow: '0 10px 40px rgba(0,0,0,0.3)' },
  toast: { position: 'fixed', bottom: '30px', left: '50%', transform: 'translateX(-50%)', padding: '15px 30px', borderRadius: '10px', background: '#333', color: '#fff', fontWeight: 'bold', zIndex: 2000 },
};

const categoryEmojis = { Beverages: '☕', Bakery: '🥐', Food: '🥪', Snacks: '🍪', default: '📦' };

// Format currency with ﷼
const fc = (amount) => `${amount.toFixed(2)} ﷼`;
const fcNeg = (amount) => `-${amount.toFixed(2)} ﷼`;

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
  const [loyaltySelections, setLoyaltySelections] = useState({});
  const [showConflictModal, setShowConflictModal] = useState(null);
  const selectionsRef = useRef({});
  selectionsRef.current = loyaltySelections;

  const companyInfo = { companyName: 'كيو', companyNameEn: 'Q', vat: '312001752300003', configName: 'Main POS', address: 'شارع الأمير محمد بن عبدالعزيز', neighborhood: 'حي الصفا', buildingNumber: '4291', plotId: '9418', postalCode: '23251', city: 'جدة', region: 'مكه', country: 'Saudi Arabia' };

  const loadData = useCallback(async () => {
    try {
      const [prodRes, loyRes] = await Promise.all([productApi.getAll(), loyaltyApi.getActive()]);
      setProducts(prodRes.data);
      console.log("*****************")
      console.log(loyRes.data)
      setLoyalties(loyRes.data);
    } catch (error) { console.error('Error loading data:', error); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const showMessage = (msg) => { setMessage(msg); setTimeout(() => setMessage(''), 3000); };

  const handleOpenSession = async () => {
    if (!cashierName.trim()) { showMessage('Please enter your name'); return; }
    try { setLoading(true); const r = await sessionApi.open({ cashierName: cashierName.trim(), openingCash: parseFloat(openingCash) || 0 }); setSession(r.data); }
    catch (e) { showMessage('Error opening session'); } finally { setLoading(false); }
  };

  const handleCloseSession = async () => {
    if (!session) return;
    try { setLoading(true); await sessionApi.close(session.id, { closingCash: 0, notes: '' }); setSession(null); setCart([]); setCashierName(''); setOpeningCash(''); setLoyaltySelections({}); }
    catch (e) { showMessage('Error closing session'); } finally { setLoading(false); }
  };

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

  // =========================================================
  // CONFLICT DETECTION - ONLY FOR BUY_X_GET_Y (type === 1)
  // Discount programs (type === 0) are NOT included since BOGO has priority
  // =========================================================
  const detectConflicts = useCallback((cartItems) => {
    const cartMap = {};
    cartItems.forEach(item => { cartMap[item.barcode] = item; });

    const triggerGroups = {};

    loyalties.forEach(loyalty => {
      // ONLY CHECK BUY_X_GET_Y PROGRAMS
      if (!loyalty.active || loyalty.type !== 1) return;
      
      const triggerBarcodes = (loyalty.triggerProductIds || '').split(',').map(s => s.trim()).filter(Boolean);
      const rewardBarcodes = (loyalty.rewardProductIds || '').split(',').map(s => s.trim()).filter(Boolean);
      
      if (!triggerBarcodes.length || !rewardBarcodes.length) return;

      const minQty = loyalty.minQuantity || 1;

      let activeTrigger = null;
      for (const tb of triggerBarcodes) {
        if (cartMap[tb] && cartMap[tb].quantity >= minQty) {
          activeTrigger = tb;
          break;
        }
      }

      if (!activeTrigger) return;

      const rewardsInCart = rewardBarcodes.filter(rb => cartMap[rb] && cartMap[rb].quantity > 0);
      if (rewardsInCart.length === 0) return;

      if (!triggerGroups[activeTrigger]) {
        triggerGroups[activeTrigger] = [];
      }

      triggerGroups[activeTrigger].push({
        loyalty,
        triggerBarcode: activeTrigger,
        rewardsInCart,
      });
    });

    const conflicts = [];

    Object.keys(triggerGroups).forEach(triggerBarcode => {
      const programs = triggerGroups[triggerBarcode];
      
      if (programs.length > 1) {
        const triggerProduct = cartMap[triggerBarcode];
        
        const options = programs.map(p => {
          // Savings = REWARD product price × quantity
          const rewardQtyPerSet = p.loyalty.rewardQuantity || 1;
          const potentialSavings = p.rewardsInCart.reduce((sum, rb) => {
            return sum + (cartMap[rb].price * rewardQtyPerSet);
          }, 0);

          return {
            loyaltyId: p.loyalty.id || p.loyalty.name,
            loyaltyName: p.loyalty.name,
            type: p.loyalty.type,
            discountPercent: 0,
            rewardProducts: p.rewardsInCart.map(rb => ({
              barcode: rb,
              name: cartMap[rb].name,
              price: cartMap[rb].price,
            })),
            potentialSavings: potentialSavings,
          };
        });

        conflicts.push({
          conflictKey: triggerBarcode,
          triggerProduct: triggerProduct.name,
          triggerBarcode: triggerBarcode,
          options: options,
        });
      }
    });

    return conflicts;
  }, [loyalties]);

  useEffect(() => {
    if (cart.length === 0) { 
      setLoyaltySelections({}); 
      setShowConflictModal(null); 
      return; 
    }

    const conflicts = detectConflicts(cart);
    const currentSel = selectionsRef.current;

    const activeKeys = new Set(conflicts.map(c => c.conflictKey));
    const cleaned = {};
    Object.keys(currentSel).forEach(key => { 
      if (activeKeys.has(key)) cleaned[key] = currentSel[key]; 
    });

    for (const c of conflicts) {
      const sel = cleaned[c.conflictKey];
      if (sel) {
        const selectedOption = c.options.find(opt => opt.loyaltyId === sel);
        if (!selectedOption) {
          delete cleaned[c.conflictKey];
        }
      }
    }

    setLoyaltySelections(cleaned);

    for (const c of conflicts) {
      const sel = cleaned[c.conflictKey];
      if (!sel) {
        setShowConflictModal(c);
        return;
      }
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
      if (!newSel[c.conflictKey]) {
        setTimeout(() => setShowConflictModal(c), 100);
        return;
      }
    }
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
  


  console.log("here")
  const minQty = loyalty.minQuantity || 1;
  const maxQty = loyalty.maxQuantity || 0; // NEW: 0 = unlimited, >0 = limited uses


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
    // BOGO - Buy X Get Y Free
    const rewardQtyPerSet = loyalty.rewardQuantity || 1;
    
    for (const rb of rewardBarcodes) {
      const rewardItem = cartMap[rb];
      if (!rewardItem) continue;
      
      const availReward = rewardItem.quantity - (consumedReward[rb] || 0);
      if (availReward <= 0) continue;
      
      // Calculate maximum sets based on trigger and reward availability
      const maxSetsFromTrigger = Math.floor(triggerAvailable / minQty);
      const maxSetsFromReward = Math.floor(availReward / rewardQtyPerSet);
      let maxPossibleSets = Math.min(maxSetsFromTrigger, maxSetsFromReward);
      
      // Apply max_quantity limit
      let actualSets;
      if (maxQty === 0) {
        // UNLIMITED: Use all possible sets
        actualSets = maxPossibleSets;
      } else {
        // LIMITED: Cap at max_quantity
        actualSets = Math.min(maxPossibleSets, maxQty);
      }
      
      if (actualSets <= 0) continue;
      
      const freeQty = actualSets * rewardQtyPerSet;
      const triggerQtyUsed = actualSets * minQty;
      
      bogoRewardedBarcodes.add(rb);
      
      sections.push({
        loyaltyId: loyalty.id || loyalty.name, 
        loyaltyName: loyalty.name, 
        type: 1, 
        discountPercent: 0,
        triggerItems: [{ 
          barcode: triggerBarcode, 
          name: triggerItem.name, 
          price: triggerItem.price, 
          quantity: triggerQtyUsed, 
          lineTotal: triggerItem.price * triggerQtyUsed 
        }],
        rewardItems: [{ 
          barcode: rb, 
          name: rewardItem.name, 
          price: rewardItem.price, 
          quantity: freeQty, 
          freeQty, 
          discountAmount: freeQty * rewardItem.price, 
          lineTotal: 0 
        }],
        sectionSubtotal: triggerItem.price * triggerQtyUsed,
        totalDiscount: freeQty * rewardItem.price,
      });
      
      consumedTrigger[triggerBarcode] = (consumedTrigger[triggerBarcode] || 0) + triggerQtyUsed;
      consumedReward[rb] = (consumedReward[rb] || 0) + freeQty;
      
      break; // Only one reward product per loyalty
    }
    
  } else if (loyalty.type === 0) {
    // DISCOUNT - X% off
    const pct = parseFloat(loyalty.discountPercent) || 0;
    const rewardQtyPerSet = loyalty.rewardQuantity || 1;
    
    for (const rb of rewardBarcodes) {
      if (bogoRewardedBarcodes.has(rb)) continue;
      const rewardItem = cartMap[rb];
      if (!rewardItem) continue;
      
      const availReward = rewardItem.quantity - (consumedReward[rb] || 0);
      if (availReward <= 0) continue;
      
      // Calculate maximum sets based on trigger and reward availability
      const maxSetsFromTrigger = Math.floor(triggerAvailable / minQty);
      const maxSetsFromReward = Math.floor(availReward / rewardQtyPerSet);
      let maxPossibleSets = Math.min(maxSetsFromTrigger, maxSetsFromReward);
      
      // Apply max_quantity limit
      let actualSets;
      if (maxQty === 0) {
        // UNLIMITED: Use all possible sets
        actualSets = maxPossibleSets;
      } else {
        // LIMITED: Cap at max_quantity
        actualSets = Math.min(maxPossibleSets, maxQty);
      }
      
      if (actualSets <= 0) continue;
      
      const rewardQty = actualSets * rewardQtyPerSet;
      const triggerQtyUsed = actualSets * minQty;
      const discountAmt = (rewardItem.price * rewardQty * pct) / 100;
      
      sections.push({
        loyaltyId: loyalty.id || loyalty.name, 
        loyaltyName: loyalty.name, 
        type: 0, 
        discountPercent: pct,
        triggerItems: [{ 
          barcode: triggerBarcode, 
          name: triggerItem.name, 
          price: triggerItem.price, 
          quantity: triggerQtyUsed, 
          lineTotal: triggerItem.price * triggerQtyUsed 
        }],
        rewardItems: [{ 
          barcode: rb, 
          name: rewardItem.name, 
          price: rewardItem.price, 
          quantity: rewardQty, 
          freeQty: 0, 
          discountAmount: discountAmt, 
          lineTotal: rewardItem.price * rewardQty 
        }],
        sectionSubtotal: (triggerItem.price * triggerQtyUsed) + (rewardItem.price * rewardQty) - discountAmt,
        totalDiscount: discountAmt,
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

  const handlePayment = async (paymentMethod) => {
    if (cart.length === 0 || hasUnresolvedConflicts()) return;
    try {
      setLoading(true);
      const r = await orderApi.create({ 
        sessionId: session.id, 
        items: cart.map(i => ({ barcode: i.barcode, quantity: i.quantity })), 
        paymentMethod, 
        cashierName: session.cashierName 
      });
      setShowPayment(false);
      setCompletedOrder({
        orderNumber: r.data.orderNumber || r.data.id || `ORD-${Date.now()}`,
        items: cart.map(i => ({ name: i.name, price: i.price, quantity: i.quantity, barcode: i.barcode })),
        loyaltySections: totals.sections, 
        remainingItems: totals.remainingItems,
        subtotal: totals.subtotal, 
        taxAmount: totals.totalTax, 
        totalAmount: totals.total, 
        discountAmount: totals.totalDiscount,
        paymentMethod, 
        cashierName: session.cashierName, 
        createdAt: new Date().toISOString(), 
        amountPaid: totals.total, 
        change: 0,
      });
      setCart([]); 
      setLoyaltySelections({}); 
      showMessage('Order completed successfully!');
    } catch (e) { 
      showMessage('Error processing order'); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleFileImport = async (type, file) => {
    try { 
      setLoading(true); 
      if (type === 'products') await productApi.import(file); 
      else if (type === 'loyalty') await loyaltyApi.import(file); 
      await loadData(); 
      showMessage(`${type} imported successfully!`); 
    }
    catch (e) { 
      showMessage(`Error importing ${type}`); 
    } finally { 
      setLoading(false); 
    }
  };

  if (!session) {
    return (
      <div style={styles.app}><div style={styles.modal}><div style={styles.modalContent}>
        <h2 style={{ textAlign: 'center', marginBottom: '10px', color: '#2563eb' }}>POS System</h2>
        <p style={{ textAlign: 'center', color: '#666', marginBottom: '30px' }}>Point of Sale Terminal</p>
        <h3 style={{ marginBottom: '20px', color: '#333' }}>Open New Session</h3>
        <input style={styles.input} placeholder="Enter your name" value={cashierName} onChange={e => setCashierName(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleOpenSession()} />
        <input style={styles.input} placeholder="Opening cash (optional)" type="number" value={openingCash} onChange={e => setOpeningCash(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleOpenSession()} />
        <button style={{ ...styles.button, ...styles.primaryBtn, width: '100%', padding: '15px' }} onClick={handleOpenSession} disabled={loading}>{loading ? 'Opening...' : 'Start Session'}</button>
        {message && <p style={{ textAlign: 'center', marginTop: '15px', color: '#dc3545' }}>{message}</p>}
      </div></div></div>
    );
  }

  return (
    <div style={styles.app}>
      <header style={styles.header}>
        <div style={styles.logo}>POS System</div>
        <div style={styles.sessionInfo}>
          <span>Cashier: <strong>{session.cashierName}</strong></span>
          <span style={styles.badge}>Session #{session.sessionNumber || session.id}</span>
          <button style={{ ...styles.button, ...styles.dangerBtn }} onClick={handleCloseSession}>Close Session</button>
        </div>
      </header>

      <main style={styles.main}>
        <div style={styles.tabs}>
          {['pos', 'products', 'import'].map(tab => (
            <button key={tab} style={{ ...styles.tab, ...(activeTab === tab ? styles.tabActive : {}) }} onClick={() => setActiveTab(tab)}>
              {tab === 'pos' ? 'POS' : tab === 'products' ? 'Products' : 'Import'}
            </button>
          ))}
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
      </main>

      {showPayment && (
        <div style={styles.modal} onClick={() => setShowPayment(false)}>
          <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <h2 style={{ textAlign: 'center', marginBottom: '10px' }}>Complete Payment</h2>
            <div style={{ textAlign: 'center', fontSize: '36px', fontWeight: 'bold', color: '#2563eb', marginBottom: '25px' }}>{fc(totals.total)}</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
              <button style={{ padding: '25px', borderRadius: '15px', border: '2px solid #e0e0e0', background: '#fff', cursor: 'pointer', fontSize: '18px', fontWeight: 'bold' }} onClick={() => handlePayment('CASH')} disabled={loading}>💵 Cash</button>
              <button style={{ padding: '25px', borderRadius: '15px', border: '2px solid #e0e0e0', background: '#fff', cursor: 'pointer', fontSize: '18px', fontWeight: 'bold' }} onClick={() => handlePayment('CARD')} disabled={loading}>💳 Card</button>
            </div>
            <button style={{ width: '100%', padding: '15px', borderRadius: '10px', border: '1px solid #e0e0e0', background: '#fff', cursor: 'pointer' }} onClick={() => setShowPayment(false)}>Cancel</button>
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
            <p style={{ textAlign: 'center', color: '#999', marginBottom: '20px', fontSize: '12px' }}>
              اختر المنتج المجاني / Select which item to get FREE:
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '15px' }}>
              {showConflictModal.options.map(opt => (
                <button 
                  key={opt.loyaltyId}
                  style={{ 
                    padding: '18px 20px', 
                    borderRadius: '12px', 
                    border: '2px solid #e0e0e0', 
                    background: '#fff', 
                    cursor: 'pointer', 
                    textAlign: 'left',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => { 
                    e.currentTarget.style.borderColor = '#28a745'; 
                    e.currentTarget.style.background = '#f0fff4';
                    e.currentTarget.style.transform = 'translateX(-3px)';
                  }}
                  onMouseLeave={e => { 
                    e.currentTarget.style.borderColor = '#e0e0e0'; 
                    e.currentTarget.style.background = '#fff'; 
                    e.currentTarget.style.transform = 'translateX(0)';
                  }}
                  onClick={() => handleConflictSelect(showConflictModal.conflictKey, opt.loyaltyId)}>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 'bold', fontSize: '15px', color: '#333', marginBottom: '4px' }}>
                        🎁 {opt.loyaltyName}
                      </div>
                      <div style={{ fontSize: '13px', color: '#28a745', marginBottom: '6px', fontWeight: 'bold' }}>
                        Get FREE: {opt.rewardProducts.map(rp => rp.name).join(', ')}
                      </div>
                      <div style={{ fontSize: '12px', color: '#888' }}>
                        Value: {opt.rewardProducts.map(rp => fc(rp.price)).join(', ')}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', marginLeft: '15px' }}>
                      <div style={{ fontSize: '11px', color: '#888', marginBottom: '3px' }}>You Save</div>
                      <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#28a745' }}>
                        {fc(opt.potentialSavings)}
                      </div>
                    </div>
                  </div>

                  <div style={{ 
                    marginTop: '8px', 
                    paddingTop: '8px', 
                    borderTop: '1px dashed #e0e0e0',
                    textAlign: 'center',
                    fontSize: '13px',
                    fontWeight: 'bold',
                    color: '#28a745'
                  }}>
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