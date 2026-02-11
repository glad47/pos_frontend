import React, { useState, useEffect, useCallback, useRef } from 'react';
import { productApi, loyaltyApi, sessionApi, orderApi, employeeApi } from './services/api';
import OrderComplete from './components/OrderComplete';
import ReturnPOS from './components/ReturnPOS';
import Login from './components/Login';
import ManagerDashboard from './components/ManagerDashboardComp';

// PRESERVED: All original styles from your working POS
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
  posTypeTabDisabled: { opacity: 0.5, cursor: 'not-allowed', background: '#f0f0f0' },
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
  qtyBtn: { width: '30px', height: '30px', borderRadius: '50%', border: 'none', background: '#2563eb', color: '#fff', cursor: 'pointer', fontWeight: 'bold' },
  modal: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modalContent: { background: '#fff', borderRadius: '20px', padding: '30px', maxWidth: '500px', width: '90%', boxShadow: '0 10px 40px rgba(0,0,0,0.3)' },
  toast: { position: 'fixed', bottom: '30px', left: '50%', transform: 'translateX(-50%)', padding: '15px 30px', borderRadius: '10px', background: '#333', color: '#fff', fontWeight: 'bold', zIndex: 2000 },
  refreshBtn: { padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#28a745', color: '#fff', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' },
  infoBox: { background: '#fff3cd', border: '2px solid #ffc107', borderRadius: '10px', padding: '15px', marginBottom: '15px', fontSize: '14px' },
  warningBox: { background: '#fff3cd', border: '2px solid #ffc107', borderRadius: '10px', padding: '15px', marginBottom: '15px', fontSize: '14px' },
  errorText: { color: '#dc3545', fontSize: '12px', marginTop: '-10px', marginBottom: '10px', paddingLeft: '5px', fontWeight: 'bold' },
  inputError: { borderColor: '#dc3545' },
  checkboxContainer: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px', padding: '12px', background: '#f8f9fa', borderRadius: '10px', cursor: 'pointer' },
  checkbox: { width: '20px', height: '20px', cursor: 'pointer' },
  phoneInputContainer: { display: 'flex', gap: '10px', marginBottom: '15px' },
  phonePrefix: { padding: '15px', borderRadius: '10px', border: '2px solid #e0e0e0', background: '#f8f9fa', color: '#333', fontSize: '16px', fontWeight: 'bold', minWidth: '80px', textAlign: 'center' },
};

const fc = (amount) => `${(Number(amount) || 0).toFixed(2)} ﷼`;
const fcNeg = (amount) => `-${(Number(amount) || 0).toFixed(2)} ﷼`;

const validateSaudiPhone = (phone) => {
  const cleaned = phone.replace(/[\s-]/g, '');
  return /^5[0-9]{8}$/.test(cleaned);
};

const validateSaudiVAT = (vat) => {
  const cleaned = vat.replace(/[\s-]/g, '');
  return /^[0-9]{15}$/.test(cleaned);
};

// NEW: Categories that use dynamic weight-based barcodes
const WEIGHT_BASED_CATEGORIES = [
  'قسم البهارات والمكسرات خارجي',
  'الملحمة',
  'الخضار والفواكه',
  'قسم الاجبان خارجي'
];

// NEW: Parse dynamic barcode and extract weight
const parseDynamicBarcode = (scannedBarcode) => {
  // Dynamic barcode format: 7 digits (product code) + 6 digits (weight in grams)
  if (scannedBarcode.length === 13) {
    const productCode = scannedBarcode.substring(0, 7);
    const weightCode = scannedBarcode.substring(7, 13);
    const weightInKg = parseInt(weightCode, 10) / 10000; // Convert grams to kg
    
    return {
      isDynamic: true,
      productCode,
      weightInKg,
      scannedBarcode
    };
  }
  
  return {
    isDynamic: false,
    productCode: scannedBarcode,
    weightInKg: 1,
    scannedBarcode
  };
};

// NEW: Find product by base barcode (first 7 digits)
const findProductByBaseBarcode = (products, baseBarcode) => {
  return products.find(p => {
    if (WEIGHT_BASED_CATEGORIES.includes(p.category)) {
      // For weight-based categories, match first 7 digits
      return p.barcode && p.barcode.substring(0, 7) === baseBarcode;
    }
    return p.barcode === baseBarcode;
  });
};

function App() {
  // NEW: Authentication state
  const [currentEmployee, setCurrentEmployee] = useState(null);
  const [selectedSessionToManage, setSelectedSessionToManage] = useState(null);

  // PRESERVED: All original POS state
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
  const [customerInfo, setCustomerInfo] = useState({ name: '', phone: '', vat: '', needsVat: false });
  const [validationErrors, setValidationErrors] = useState({ phone: '', vat: '' });
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

  // PRESERVED: All original functions
  const showMessage = (msg) => { setMessage(msg); setTimeout(() => setMessage(''), 3000); };

  const loadData = useCallback(async () => {
    try {
      const [prodRes, loyRes] = await Promise.all([productApi.getAll(), loyaltyApi.getActive()]);
      setProducts(Array.isArray(prodRes.data) ? prodRes.data : []);
      setLoyalties(Array.isArray(loyRes.data) ? loyRes.data : (loyRes.data?.data || []));
      console.log('[POS] Loaded', prodRes.data?.length || 0, 'products');
      showMessage('Data refreshed successfully');
    } catch (error) { 
      console.error('Error loading data:', error);
      showMessage('Error loading data');
    }
  }, []);

  useEffect(() => { if (currentEmployee) loadData(); }, [currentEmployee, loadData]);

  // Send cart and totals updates to customer display window
  useEffect(() => {
    if (customerDisplayWindow && !customerDisplayWindow.closed) {
      try {
        const currentTotals = calculateTotals();
        customerDisplayWindow.postMessage({
          type: 'UPDATE_ALL',
          data: {
            cart,
            totals: currentTotals,
            companyInfo
          }
        }, window.location.origin);
      } catch (err) {
        console.log('Could not send to customer display:', err);
      }
    }
  }, [cart, customerDisplayWindow, companyInfo]);

  // NEW: Employee login handler
  const handleLogin = async (employeeId, pin) => {
    try {
      const response = await employeeApi.login({ employeeId, pin });
      if (response.data.success) {
        setCurrentEmployee(response.data.employee);
        setCashierName(response.data.employee.name);
        showMessage(`Welcome ${response.data.employee.name}!`);
      } else {
        throw new Error(response.data.message || 'Login failed');
      }
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Login failed. Check credentials.');
    }
  };

  // NEW: Logout handler
  const handleLogout = () => {
    if (customerDisplayWindow && !customerDisplayWindow.closed) {
      customerDisplayWindow.close();
    }
    setCurrentEmployee(null);
    setSession(null);
    setSelectedSessionToManage(null);
    setCart([]);
    setCashierName('');
    showMessage('Logged out successfully');
  };

  // NEW: Manager selects a session to manage
  const handleSelectSession = (selectedSession) => {
    setSelectedSessionToManage(selectedSession);
    setSession(selectedSession);
    setCashierName(selectedSession.cashierName);
  };

  // NEW: Open new session for manager
  const handleOpenNewSession = async () => {
    if (!currentEmployee) return;
    try {
      setLoading(true);
      const response = await sessionApi.open({ 
        cashierName: currentEmployee.name,
        employeeId: currentEmployee.employeeId,
        openingCash: 0 
      });
      const sessionData = response.data.session || response.data;
      setSession(sessionData);
      setCashierName(currentEmployee.name);
      showMessage('Session opened successfully');
    } catch (error) {
      showMessage('Error opening session');
    } finally {
      setLoading(false);
    }
  };

  // PRESERVED: Original session opening
  const handleOpenSession = async () => {
    if (!cashierName.trim()) { showMessage('Please enter your name'); return; }
    try { 
      setLoading(true); 
      const response = await sessionApi.open({ 
        cashierName: cashierName.trim(),
        employeeId: currentEmployee?.employeeId || null,
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
    finally { setLoading(false); }
  };

  // MODIFIED: Only managers can close sessions
  const handleCloseSession = async () => {
    if (!session || !currentEmployee) return;
    
    // Check if user is manager
    if (!currentEmployee.managerUser) {
      showMessage('Only managers can close sessions');
      return;
    }

    if (customerDisplayWindow && !customerDisplayWindow.closed) {
      customerDisplayWindow.close();
    }
    try { 
      setLoading(true); 
      await sessionApi.close(session.id, { closingCash: 0, notes: '' }); 
      setSession(null); 
      setCart([]); 
      setOpeningCash(''); 
      setLoyaltySelections({});
      setCustomerInfo({ name: '', phone: '', vat: '', needsVat: false });
      setValidationErrors({ phone: '', vat: '' });
      setIsExistingSession(false);
      setSelectedSessionToManage(null);
      showMessage('Session closed successfully');
    }
    catch (e) { showMessage('Error closing session'); } 
    finally { setLoading(false); }
  };

  const handleRefreshData = async () => {
    setLoading(true);
    await loadData();
    setLoading(false);
  };

  // MODIFIED: Handle dynamic barcodes
  const handleAddByBarcode = async () => {
    if (!barcode.trim()) return;
    
    const scannedBarcode = barcode.trim();
    const barcodeInfo = parseDynamicBarcode(scannedBarcode);
    
    try {
      let product;
      
      if (barcodeInfo.isDynamic) {
        // Try to find product by base barcode (first 7 digits)
        product = findProductByBaseBarcode(products, barcodeInfo.productCode);
        
        if (!product) {
          // If not found locally, try API with base barcode
          try {
            const response = await productApi.getByBarcode(barcodeInfo.productCode);
            product = response.data;
          } catch (apiError) {
            console.log('Product not found with base barcode, trying full barcode');
          }
        }
        
        if (product && WEIGHT_BASED_CATEGORIES.includes(product.category)) {
          // Create a weighted product entry
          const weightedProduct = {
            ...product,
            barcode: scannedBarcode, // Use full scanned barcode as unique identifier
            baseBarcode: barcodeInfo.productCode, // Store base barcode for reference
            weight: barcodeInfo.weightInKg,
            price: product.price * barcodeInfo.weightInKg, // Calculate price based on weight
            isWeightBased: true,
            name: `${product.name} (${barcodeInfo.weightInKg.toFixed(3)} كجم)` // Add weight to name
          };
          addToCart(weightedProduct);
          setBarcode('');
          showMessage(`Added: ${barcodeInfo.weightInKg.toFixed(3)} kg at ${fc(weightedProduct.price)}`);
          return;
        }
      }
      
      // Standard barcode lookup
      if (!product) {
        const response = await productApi.getByBarcode(scannedBarcode);
        product = response.data;
      }
      
      addToCart(product);
      setBarcode('');
    } catch (e) {
      console.error('Barcode lookup error:', e);
      showMessage('Product not found');
    }
  };

  const addToCart = (product) => {
    setCart(prev => {
      // For weight-based products, use full barcode as unique identifier
      const identifier = product.isWeightBased ? product.barcode : product.barcode;
      const ex = prev.find(i => i.barcode === identifier);
      
      if (ex) {
        // For weight-based items, add quantities (weights will accumulate)
        return prev.map(i => i.barcode === identifier ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (bcode, delta) => {
    setCart(prev => prev.map(i => i.barcode === bcode ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i).filter(i => i.quantity > 0));
  };

  const removeFromCart = (bcode) => { setCart(prev => prev.filter(i => i.barcode !== bcode)); };

  // PRESERVED: All original loyalty detection and calculation logic (UNCHANGED)
  const detectConflicts = useCallback((cartItems) => {
    const cartMap = {};
    cartItems.forEach(item => { 
      // Use baseBarcode for weight-based items in loyalty matching
      const lookupBarcode = item.baseBarcode || item.barcode;
      cartMap[lookupBarcode] = item; 
    });
    const triggerGroups = {};

    const idToBarcode = {};
    products.forEach(p => { if (p.id != null) idToBarcode[String(p.id)] = p.barcode; });
    const resolveIds = (idStr) => (idStr || '').split(',').map(s => s.trim()).filter(Boolean).map(id => idToBarcode[id] || id);

    const normD = (l) => ({
      ...l,
      triggerProductIds: l.triggerProductIds || l.trigger_product_ids || '',
      rewardProductIds: l.rewardProductIds || l.reward_product_ids || '',
      minQuantity: parseInt(l.minQuantity ?? l.min_quantity ?? l.minquantity) || 1,
      maxQuantity: parseInt(l.maxQuantity ?? l.max_quantity ?? l.maxquantity) || 0,
      rewardQuantity: parseInt((l.rewardQuantity ?? l.reward_quantity) || l.rewardquantity) || 1,
    });

    loyalties.forEach(rawLoyalty => {
      if (!rawLoyalty.active || rawLoyalty.type !== 1) return;
      const loyalty = normD(rawLoyalty);
      const afterDiscount = parseFloat(loyalty.afterDiscount ?? loyalty.after_discount) || 0;
      const triggerBarcodes = resolveIds(loyalty.triggerProductIds);
      const rewardBarcodes = resolveIds(loyalty.rewardProductIds);
      if (!triggerBarcodes.length || !rewardBarcodes.length) return;
      const minQty = loyalty.minQuantity;
      const rewardQtyPerSet = loyalty.rewardQuantity;

      const triggerSet = new Set(triggerBarcodes);
      const rewardSet = new Set(rewardBarcodes);
      const listsAreDifferent = triggerBarcodes.length !== rewardBarcodes.length ||
        triggerBarcodes.some(tb => !rewardSet.has(tb)) ||
        rewardBarcodes.some(rb => !triggerSet.has(rb));

      let realTriggerBarcodes = triggerBarcodes;
      let realRewardBarcodes = rewardBarcodes;
      let hasDistinctRewards = false;

      if (listsAreDifferent) {
        hasDistinctRewards = true;
      } else if (afterDiscount > 0) {
        const productPriceMap = {};
        products.forEach(p => { if (p.barcode) productPriceMap[p.barcode] = p.price; });
        Object.keys(cartMap).forEach(bc => { if (!productPriceMap[bc]) productPriceMap[bc] = cartMap[bc].price; });

        const triggerByPrice = triggerBarcodes.filter(tb => {
          const price = productPriceMap[tb];
          return price != null && Math.abs(price - afterDiscount) < 0.01;
        });
        if (triggerByPrice.length > 0) {
          realTriggerBarcodes = triggerByPrice;
          realRewardBarcodes = rewardBarcodes.filter(rb => !realTriggerBarcodes.includes(rb));
          if (realRewardBarcodes.length > 0) {
            hasDistinctRewards = true;
          }
        }
      }

      if (!hasDistinctRewards) {
        realRewardBarcodes = rewardBarcodes;
      }

      let activeTrigger = null;
      for (const tb of realTriggerBarcodes) {
        if (!cartMap[tb]) continue;
        const qty = cartMap[tb].quantity;
        
        if (hasDistinctRewards) {
          const hasRewardInCart = realRewardBarcodes.some(rb => rb !== tb && cartMap[rb] && cartMap[rb].quantity >= rewardQtyPerSet);
          if (qty >= minQty && hasRewardInCart) { activeTrigger = tb; break; }
        } else if (realRewardBarcodes.includes(tb)) {
          const requiredQty = minQty + rewardQtyPerSet;
          if (qty >= requiredQty) { activeTrigger = tb; break; }
        }
      }
      if (!activeTrigger) return;

      let rewardsInCart;
      if (hasDistinctRewards) {
        rewardsInCart = realRewardBarcodes.filter(rb => rb !== activeTrigger && cartMap[rb] && cartMap[rb].quantity > 0);
      } else {
        rewardsInCart = [activeTrigger];
      }
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
          const nl = normD(p.loyalty);
          const rewardQtyPerSet = nl.rewardQuantity;
          const potentialSavings = p.rewardsInCart.reduce((sum, rb) => sum + (cartMap[rb].price * rewardQtyPerSet), 0);
          return {
            loyaltyId: nl.id || nl.name, loyaltyName: nl.name, type: nl.type, discountPercent: 0,
            rewardProducts: p.rewardsInCart.map(rb => ({ barcode: rb, name: cartMap[rb].name, price: cartMap[rb].price })),
            potentialSavings: potentialSavings
          };
        });
        conflicts.push({ conflictKey: triggerBarcode, triggerProduct: triggerProduct.name, triggerBarcode: triggerBarcode, options: options });
      }
    });
    return conflicts;
  }, [loyalties, products]);

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
    // PRESERVED: COMPLETE ORIGINAL LOYALTY CALCULATION LOGIC - NOT MODIFIED
    // NOTE: For weight-based items, we use baseBarcode for loyalty matching
    const cartMap = {};
    cartItems.forEach(item => { 
      const lookupBarcode = item.baseBarcode || item.barcode;
      cartMap[lookupBarcode] = { ...item }; 
    });
    const bogoRewardedBarcodes = new Set();
    const currentSel = selectionsRef.current;

    const idToBarcode = {};
    products.forEach(p => { if (p.id != null) idToBarcode[String(p.id)] = p.barcode; });
    const resolveIds = (idStr) => (idStr || '').split(',').map(s => s.trim()).filter(Boolean).map(id => idToBarcode[id] || id);

    const norm = (l) => ({
      ...l,
      triggerProductIds: l.triggerProductIds || l.trigger_product_ids || '',
      rewardProductIds: l.rewardProductIds || l.reward_product_ids || '',
      minQuantity: parseInt(l.minQuantity ?? l.min_quantity ?? l.minquantity) || 1,
      maxQuantity: parseInt(l.maxQuantity ?? l.max_quantity ?? l.maxquantity) || 0,
      rewardQuantity: parseInt((l.rewardQuantity ?? l.reward_quantity) ?? l.rewardquantity) || 1,
      discountAmount: parseFloat(l.discountAmount ?? l.discount_amount) || 0,
      afterDiscount: parseFloat(l.afterDiscount ?? l.after_discount) || 0,
      discountPercent: parseFloat(l.discountPercent ?? l.discount_percent) || 0,
    });

    const activeLoyalties = loyalties.filter(loyalty => {
      if (!loyalty.active) return false;
      const n = norm(loyalty);
      const triggerBarcodes = resolveIds(n.triggerProductIds);
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
    const consumed = {};

    sorted.forEach(rawLoyalty => {
      const loyalty = norm(rawLoyalty);
      const triggerBarcodes = resolveIds(loyalty.triggerProductIds);
      let rewardBarcodes = resolveIds(loyalty.rewardProductIds);
      if (!triggerBarcodes.length) return;
      
      const fixedDiscount = loyalty.discountAmount;
      const afterDiscount = loyalty.afterDiscount;
      const isFixedDiscount = fixedDiscount > 0 || afterDiscount > 0;
      
      if (loyalty.type === 0 && isFixedDiscount) {
        if (!rewardBarcodes.length) rewardBarcodes = [...triggerBarcodes];
      } else {
        if (!rewardBarcodes.length) return;
      }

      const minQty = loyalty.minQuantity;
      const maxQty = loyalty.maxQuantity;

      if (loyalty.type === 0 && isFixedDiscount) {
        const eligibleInCart = [];
        for (const bc of triggerBarcodes) {
          const item = cartMap[bc];
          if (!item) continue;
          const avail = item.quantity - (consumed[bc] || 0);
          if (avail > 0) {
            eligibleInCart.push({ barcode: bc, name: item.name, price: item.price, available: avail });
          }
        }
        
        const totalAvailable = eligibleInCart.reduce((sum, e) => sum + e.available, 0);
        if (totalAvailable < minQty) return;
        
        let maxPossibleSets = Math.floor(totalAvailable / minQty);
        let actualSets = maxQty === 0 ? maxPossibleSets : Math.min(maxPossibleSets, maxQty);
        if (actualSets <= 0) return;
        
        const totalItemsConsumed = actualSets * minQty;
        let totalItemsNeeded = totalItemsConsumed;
        const sectionTriggerItems = [];
        const sectionRewardItems = [];
        let sectionGross = 0;
        
        for (const e of eligibleInCart) {
          if (totalItemsNeeded <= 0) break;
          const take = Math.min(e.available, totalItemsNeeded);
          const lineTotal = e.price * take;
          sectionGross += lineTotal;
          
          sectionTriggerItems.push({
            barcode: e.barcode, name: e.name, price: e.price,
            quantity: take, lineTotal: lineTotal,
            afterDiscountPrice: afterDiscount > 0 ? (afterDiscount / minQty) : null,
            loyaltyLabel: afterDiscount > 0 ? loyalty.name : null,
          });
          
          consumed[e.barcode] = (consumed[e.barcode] || 0) + take;
          totalItemsNeeded -= take;
        }
        
        const newTotal = afterDiscount > 0 ? afterDiscount * actualSets : sectionGross - (fixedDiscount * actualSets);
        const totalDiscountAmt = Math.max(0, sectionGross - newTotal);
        const discountPct = sectionGross > 0 ? Math.round((totalDiscountAmt / sectionGross) * 10000) / 100 : 0;
        
        sectionRewardItems.push({
          barcode: '_group_discount_',
          name: loyalty.name,
          price: 0,
          quantity: 0,
          freeQty: 0,
          discountAmount: totalDiscountAmt,
          lineTotal: 0
        });
        
        sections.push({
          loyaltyId: loyalty.id || loyalty.name,
          loyaltyName: loyalty.name,
          type: 0,
          discountPercent: discountPct,
          afterDiscount: afterDiscount > 0 ? afterDiscount * actualSets : 0,
          triggerItems: sectionTriggerItems,
          rewardItems: sectionRewardItems,
          sectionSubtotal: sectionGross - totalDiscountAmt,
          totalDiscount: totalDiscountAmt
        });
        
      } else if (loyalty.type === 0) {
        const pct = parseFloat(loyalty.discountPercent) || 0;
        if (pct <= 0) return;

        let triggerBarcode = null, triggerAvailable = 0;
        for (const tb of triggerBarcodes) {
          const item = cartMap[tb];
          if (!item) continue;
          const avail = item.quantity - (consumed[tb] || 0);
          if (avail >= minQty) { triggerBarcode = tb; triggerAvailable = avail; break; }
        }
        if (!triggerBarcode) return;
        const triggerItem = cartMap[triggerBarcode];

        const rewardQtyPerSet = loyalty.rewardQuantity || 1;
        for (const rb of rewardBarcodes) {
          if (bogoRewardedBarcodes.has(rb)) continue;
          const rewardItem = cartMap[rb];
          if (!rewardItem) continue;
          const availReward = rewardItem.quantity - (consumed[rb] || 0);
          if (availReward <= 0) continue;
          const maxSetsFromTrigger = Math.floor(triggerAvailable / minQty);
          const maxSetsFromReward = Math.floor(availReward / rewardQtyPerSet);
          let maxPossibleSets = Math.min(maxSetsFromTrigger, maxSetsFromReward);
          let actualSets2 = maxQty === 0 ? maxPossibleSets : Math.min(maxPossibleSets, maxQty);
          if (actualSets2 <= 0) continue;
          const rewardQty = actualSets2 * rewardQtyPerSet;
          const triggerQtyUsed = actualSets2 * minQty;
          const discountAmt = (rewardItem.price * rewardQty * pct) / 100;
          sections.push({
            loyaltyId: loyalty.id || loyalty.name, loyaltyName: loyalty.name, type: 0, discountPercent: pct,
            triggerItems: [{ barcode: triggerBarcode, name: triggerItem.name, price: triggerItem.price, quantity: triggerQtyUsed, lineTotal: triggerItem.price * triggerQtyUsed }],
            rewardItems: [{ barcode: rb, name: rewardItem.name, price: rewardItem.price, quantity: rewardQty, freeQty: 0, discountAmount: discountAmt, lineTotal: rewardItem.price * rewardQty }],
            sectionSubtotal: (triggerItem.price * triggerQtyUsed) + (rewardItem.price * rewardQty) - discountAmt, totalDiscount: discountAmt
          });
          consumed[triggerBarcode] = (consumed[triggerBarcode] || 0) + triggerQtyUsed;
          consumed[rb] = (consumed[rb] || 0) + rewardQty;
        }
        
      } else if (loyalty.type === 1) {
        const rewardQtyPerSet = loyalty.rewardQuantity || 1;
        const afterDiscount = loyalty.afterDiscount;
        
        const triggerSet = new Set(triggerBarcodes);
        const rewardSet = new Set(rewardBarcodes);
        const listsAreDifferent = triggerBarcodes.length !== rewardBarcodes.length ||
          triggerBarcodes.some(tb => !rewardSet.has(tb)) ||
          rewardBarcodes.some(rb => !triggerSet.has(rb));
        
        let realTriggerBarcodes = [...triggerBarcodes];
        let realRewardBarcodes = [...rewardBarcodes];
        let hasDistinctRewards = false;
        
        const rawTriggerIds = (loyalty.triggerProductIds || loyalty.trigger_product_ids || '').toString();
        const rawRewardIds = (loyalty.rewardProductIds || loyalty.reward_product_ids || '').toString();
        console.log('[BOGO] Program:', loyalty.name, 
          '\n  Raw trigger IDs:', rawTriggerIds, '→ barcodes:', triggerBarcodes,
          '\n  Raw reward IDs:', rawRewardIds, '→ barcodes:', rewardBarcodes,
          '\n  Cart barcodes:', Object.keys(cartMap),
          '\n  Lists different:', listsAreDifferent,
          '\n  Reward barcodes in cart:', rewardBarcodes.filter(rb => cartMap[rb]).map(rb => `${rb}(${cartMap[rb]?.name})`),
          '\n  Reward barcodes NOT in cart:', rewardBarcodes.filter(rb => !cartMap[rb]));
        
        if (listsAreDifferent) {
          hasDistinctRewards = true;
        } else if (afterDiscount > 0) {
          const productPriceMap = {};
          products.forEach(p => { if (p.barcode) productPriceMap[p.barcode] = p.price; });
          Object.keys(cartMap).forEach(bc => { if (!productPriceMap[bc]) productPriceMap[bc] = cartMap[bc].price; });
          
          const triggerByPrice = triggerBarcodes.filter(tb => {
            const price = productPriceMap[tb];
            return price != null && Math.abs(price - afterDiscount) < 0.01;
          });
          
          if (triggerByPrice.length > 0) {
            realTriggerBarcodes = triggerByPrice;
            realRewardBarcodes = rewardBarcodes.filter(rb => !realTriggerBarcodes.includes(rb));
            if (realRewardBarcodes.length > 0) {
              hasDistinctRewards = true;
            }
          }
          console.log('[BOGO] Legacy after_discount fallback:', loyalty.name, 
            'afterDiscount:', afterDiscount, 'hasDistinct:', hasDistinctRewards,
            'trigger:', realTriggerBarcodes, 'reward:', realRewardBarcodes);
        }
        
        if (hasDistinctRewards) {
          for (const tb of realTriggerBarcodes) {
            const triggerItem = cartMap[tb];
            if (!triggerItem) continue;
            const triggerAvail = triggerItem.quantity - (consumed[tb] || 0);
            if (triggerAvail < minQty) continue;
            
            let foundMatch = false;
            for (const rb of realRewardBarcodes) {
              if (bogoRewardedBarcodes.has(rb)) continue;
              if (rb === tb) continue;
              const rewardItem = cartMap[rb];
              if (!rewardItem) continue;
              
              const availReward = rewardItem.quantity - (consumed[rb] || 0);
              if (availReward < rewardQtyPerSet) continue;
              
              const maxSetsFromTrigger = Math.floor(triggerAvail / minQty);
              const maxSetsFromReward = Math.floor(availReward / rewardQtyPerSet);
              let maxPossibleSets = Math.min(maxSetsFromTrigger, maxSetsFromReward);
              let actualSets = maxQty === 0 ? maxPossibleSets : Math.min(maxPossibleSets, maxQty);
              if (actualSets <= 0) continue;
              
              const freeQty = actualSets * rewardQtyPerSet;
              const triggerQtyUsed = actualSets * minQty;
              
              bogoRewardedBarcodes.add(rb);
              sections.push({
                loyaltyId: loyalty.id || loyalty.name, loyaltyName: loyalty.name, type: 1, discountPercent: 0,
                triggerItems: [{ barcode: tb, name: triggerItem.name, price: triggerItem.price, quantity: triggerQtyUsed, lineTotal: triggerItem.price * triggerQtyUsed }],
                rewardItems: [{ barcode: rb, name: rewardItem.name, price: rewardItem.price, quantity: freeQty, freeQty, discountAmount: freeQty * rewardItem.price, lineTotal: 0 }],
                sectionSubtotal: triggerItem.price * triggerQtyUsed, totalDiscount: freeQty * rewardItem.price
              });
              consumed[tb] = (consumed[tb] || 0) + triggerQtyUsed;
              consumed[rb] = (consumed[rb] || 0) + freeQty;
              foundMatch = true;
              break;
            }
            if (foundMatch) break;
          }
        } else {
          for (const tb of triggerBarcodes) {
            const triggerItem = cartMap[tb];
            if (!triggerItem) continue;
            
            let foundMatch = false;
            for (const rb of rewardBarcodes) {
              if (bogoRewardedBarcodes.has(rb)) continue;
              const rewardItem = cartMap[rb];
              if (!rewardItem) continue;
              
              if (tb === rb) {
                const totalPerSet = minQty + rewardQtyPerSet;
                const totalAvail = triggerItem.quantity - (consumed[tb] || 0);
                if (totalAvail < totalPerSet) continue;
                
                const maxPossibleSets = Math.floor(totalAvail / totalPerSet);
                let actualSets = maxQty === 0 ? maxPossibleSets : Math.min(maxPossibleSets, maxQty);
                if (actualSets <= 0) continue;
                
                const triggerQtyUsed = actualSets * minQty;
                const freeQty = actualSets * rewardQtyPerSet;
                
                bogoRewardedBarcodes.add(rb);
                sections.push({
                  loyaltyId: loyalty.id || loyalty.name, loyaltyName: loyalty.name, type: 1, discountPercent: 0,
                  triggerItems: [{ barcode: tb, name: triggerItem.name, price: triggerItem.price, quantity: triggerQtyUsed, lineTotal: triggerItem.price * triggerQtyUsed }],
                  rewardItems: [{ barcode: rb, name: rewardItem.name, price: rewardItem.price, quantity: freeQty, freeQty, discountAmount: freeQty * rewardItem.price, lineTotal: 0 }],
                  sectionSubtotal: triggerItem.price * triggerQtyUsed, totalDiscount: freeQty * rewardItem.price
                });
                consumed[tb] = (consumed[tb] || 0) + triggerQtyUsed + freeQty;
                foundMatch = true;
                break;
              } else {
                const triggerAvail = triggerItem.quantity - (consumed[tb] || 0);
                if (triggerAvail < minQty) continue;
                const availReward = rewardItem.quantity - (consumed[rb] || 0);
                if (availReward < rewardQtyPerSet) continue;
                
                const maxSetsFromTrigger = Math.floor(triggerAvail / minQty);
                const maxSetsFromReward = Math.floor(availReward / rewardQtyPerSet);
                let maxPossibleSets = Math.min(maxSetsFromTrigger, maxSetsFromReward);
                let actualSets = maxQty === 0 ? maxPossibleSets : Math.min(maxPossibleSets, maxQty);
                if (actualSets <= 0) continue;
                
                const freeQty = actualSets * rewardQtyPerSet;
                const triggerQtyUsed = actualSets * minQty;
                
                bogoRewardedBarcodes.add(rb);
                sections.push({
                  loyaltyId: loyalty.id || loyalty.name, loyaltyName: loyalty.name, type: 1, discountPercent: 0,
                  triggerItems: [{ barcode: tb, name: triggerItem.name, price: triggerItem.price, quantity: triggerQtyUsed, lineTotal: triggerItem.price * triggerQtyUsed }],
                  rewardItems: [{ barcode: rb, name: rewardItem.name, price: rewardItem.price, quantity: freeQty, freeQty, discountAmount: freeQty * rewardItem.price, lineTotal: 0 }],
                  sectionSubtotal: triggerItem.price * triggerQtyUsed, totalDiscount: freeQty * rewardItem.price
                });
                consumed[tb] = (consumed[tb] || 0) + triggerQtyUsed;
                consumed[rb] = (consumed[rb] || 0) + freeQty;
                foundMatch = true;
                break;
              }
            }
            if (foundMatch) break;
          }
        }
      }
    });

    const remainingItems = [];
    cartItems.forEach(item => {
      const lookupBarcode = item.baseBarcode || item.barcode;
      const usedTotal = consumed[lookupBarcode] || 0;
      const remaining = item.quantity - Math.min(item.quantity, usedTotal);
      if (remaining > 0) remainingItems.push({ ...item, quantity: remaining, itemSubtotal: item.price * remaining });
    });

    return { sections, remainingItems };
  }, [loyalties, products]);

  const calculateTotals = useCallback(() => {
    const { sections, remainingItems } = calculateLoyaltyBreakdown(cart);
    let subtotal = 0, totalDiscount = 0;
    
    sections.forEach(sec => {
      sec.triggerItems.forEach(ti => { subtotal += ti.lineTotal; });
      sec.rewardItems.filter(ri => ri.barcode !== '_group_discount_').forEach(ri => { subtotal += ri.price * ri.quantity; });
      totalDiscount += sec.totalDiscount;
    });
    remainingItems.forEach(item => { subtotal += item.itemSubtotal; });

    const netAmount = subtotal - totalDiscount;
    const totalTax = netAmount * 0.15 / 1.15;
    const total = netAmount;

    return { subtotal, totalTax, totalDiscount, total, sections, remainingItems };
  }, [cart, calculateLoyaltyBreakdown]);

  const totals = calculateTotals();

  const handleCheckout = () => {
    if (cart.length === 0) { showMessage('Cart is empty'); return; }
    if (hasUnresolvedConflicts()) { showMessage('Please select promotions first'); return; }
    setShowCustomerInfo(true);
  };

  const proceedToPayment = () => {
    const errors = { phone: '', vat: '' };
    let isValid = true;

    if (!customerInfo.phone || !customerInfo.phone.trim()) {
      errors.phone = 'Phone number is required';
      isValid = false;
    } else if (!validateSaudiPhone(customerInfo.phone)) {
      errors.phone = 'Invalid Saudi phone number (must be 9 digits starting with 5)';
      isValid = false;
    }

    if (customerInfo.needsVat) {
      if (!customerInfo.vat || !customerInfo.vat.trim()) {
        errors.vat = 'VAT number is required when requesting tax invoice';
        isValid = false;
      } else if (!validateSaudiVAT(customerInfo.vat)) {
        errors.vat = 'Invalid Saudi VAT number (must be 15 digits)';
        isValid = false;
      }
    }

    setValidationErrors(errors);

    if (!isValid) {
      showMessage('Please fix validation errors');
      return;
    }

    setShowCustomerInfo(false); 
    setShowPayment(true);
  };

  const handlePayment = async (method) => {
    if (cart.length === 0 || hasUnresolvedConflicts()) return;
    try {
      setLoading(true);
      const { sections } = calculateLoyaltyBreakdown(cart);
      
      const promoMap = {};
      sections.forEach(sec => {
        const isFixedGroup = sec.rewardItems.some(ri => ri.barcode === '_group_discount_');
        if (isFixedGroup) {
          const sectionGross = sec.triggerItems.reduce((s, ti) => s + ti.lineTotal, 0);
          sec.triggerItems.forEach(ti => {
            const share = sectionGross > 0 ? (ti.lineTotal / sectionGross) * sec.totalDiscount : 0;
            if (!promoMap[ti.barcode]) promoMap[ti.barcode] = { promotionName: sec.loyaltyName, isReward: false, discount: 0 };
            promoMap[ti.barcode].discount += share;
            promoMap[ti.barcode].promotionName = sec.loyaltyName;
          });
        } else {
          sec.triggerItems.forEach(ti => { 
            if (!promoMap[ti.barcode]) promoMap[ti.barcode] = { promotionName: null, isReward: false, discount: 0 };
            promoMap[ti.barcode].promotionName = sec.loyaltyName;
          });
          sec.rewardItems.filter(ri => ri.barcode !== '_group_discount_').forEach(ri => {
            if (!promoMap[ri.barcode]) promoMap[ri.barcode] = { promotionName: null, isReward: false, discount: 0 };
            promoMap[ri.barcode].promotionName = sec.loyaltyName;
            promoMap[ri.barcode].isReward = ri.freeQty > 0;
            promoMap[ri.barcode].discount += ri.discountAmount;
          });
        }
      });
      
      const itemsWithPromotions = cart.map(cartItem => {
        const pm = promoMap[cartItem.barcode] || { promotionName: null, isReward: false, discount: 0 };
        return { barcode: cartItem.barcode, quantity: cartItem.quantity, price: cartItem.price, discount: pm.discount, promotionName: pm.promotionName, isReward: pm.isReward };
      });

      let finalCustomerName = null;
      let finalCustomerPhone = null;
      let finalCustomerVat = null;

      if (customerInfo.phone && customerInfo.phone.trim()) {
        finalCustomerPhone = '+966' + customerInfo.phone.trim();
        finalCustomerName = finalCustomerPhone;
      }

      if (customerInfo.vat && customerInfo.vat.trim()) {
        finalCustomerVat = customerInfo.vat.trim();
      }

      const orderDTO = {
        items: itemsWithPromotions, 
        paymentMethod: method, 
        notes: '',
        customerName: finalCustomerName, 
        customerPhone: finalCustomerPhone, 
        customerVat: finalCustomerVat,
        orderType: posType.toUpperCase()
      };

      const response = await orderApi.create(session.id, orderDTO);
      setCompletedOrder({
        ...response.data,
        items: cart.map(i => ({ name: i.name, price: i.price, quantity: i.quantity, barcode: i.barcode })),
        loyaltySections: totals.sections, 
        remainingItems: totals.remainingItems,
        subtotal: totals.subtotal, 
        taxAmount: totals.totalTax, 
        totalAmount: totals.total, 
        discountAmount: totals.totalDiscount,
        paymentMethod: method, 
        cashierName: cashierName, 
        createdAt: new Date().toISOString(), 
        amountPaid: totals.total, 
        change: 0
      });
      setCart([]); 
      setLoyaltySelections({}); 
      setCustomerInfo({ name: '', phone: '', vat: '', needsVat: false }); 
      setValidationErrors({ phone: '', vat: '' });
      setShowPayment(false);
      showMessage('Order completed successfully!');
    } catch (error) { 
      console.error('Payment error:', error); 
      showMessage('Error processing payment'); 
    }
    finally { setLoading(false); }
  };

  const handleFileImport = async (type, file) => { 
    showMessage(`Importing ${type}...`);
    try {
      if (type === 'products') {
        await productApi.importExcel(file);
      } else if (type === 'loyalty') {
        await loyaltyApi.importExcel(file);
      }
      showMessage(`${type} imported successfully!`);
      await loadData();
    } catch (e) {
      console.error('Import error:', e);
      showMessage(`Error importing ${type}`);
    }
  };

  // NEW: Check permissions
  const canAccessSales = () => currentEmployee && (currentEmployee.saleUser || currentEmployee.managerUser);
  const canAccessReturns = () => currentEmployee && (currentEmployee.returnUser || currentEmployee.managerUser);

  // === RENDER LOGIC ===

  // 1. Login Screen
  if (!currentEmployee) {
    return <Login onLogin={handleLogin} />;
  }

  // 2. Manager Dashboard (when manager has no session open)
  if (currentEmployee.managerUser && !session) {
    return (
      <ManagerDashboard
        employee={currentEmployee}
        companyInfo={companyInfo}
        onLogout={handleLogout}
        onSelectSession={handleSelectSession}
        onOpenNewSession={handleOpenNewSession}
      />
    );
  }

  // 3. Regular Employee - Must Open Session
  if (!session) {
    return (
      <div style={styles.app}>
        <header style={styles.header}><div style={styles.logo}>🏪 {companyInfo.companyNameEn} POS</div></header>
        <main style={styles.main}>
          <div style={{ maxWidth: '400px', margin: '50px auto' }}>
            <div style={styles.panel}>
              <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>Open Session</h2>
              <div style={styles.infoBox}><strong>ℹ️ Note:</strong> Opening a new POS session for {currentEmployee.name}</div>
              <input type="number" placeholder="Opening Cash (Optional)" value={openingCash} onChange={e => setOpeningCash(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && handleOpenSession()} style={styles.input} autoFocus />
              <button onClick={handleOpenSession} disabled={loading} style={{ ...styles.button, ...styles.primaryBtn, width: '100%' }}>
                {loading ? 'Opening...' : 'Open Session / فتح الجلسة'}
              </button>
              <button onClick={handleLogout} style={{ ...styles.button, ...styles.dangerBtn, width: '100%', marginTop: '10px' }}>
                Logout / تسجيل الخروج
              </button>
            </div>
          </div>
        </main>
        {message && <div style={styles.toast}>{message}</div>}
      </div>
    );
  }

  // 4. PRESERVED: COMPLETE ORIGINAL POS INTERFACE (EXACT SAME UI)
  return (
    <div style={styles.app}>
      <header style={styles.header}>
        <div style={styles.logo}>🏪 {companyInfo.companyNameEn} POS</div>
        <div style={styles.sessionInfo}>
          <span style={styles.badge}>👤 {cashierName}</span>
          {isExistingSession && <span style={styles.badgeWarning}>🔄 جلسة مستمرة</span>}
          {/* Only managers can see total sales */}
          {currentEmployee.managerUser && <span style={styles.badge}>💰 {fc(session.totalSales)}</span>}
          {currentEmployee.managerUser && (
            <button onClick={handleCloseSession} style={{ ...styles.button, ...styles.dangerBtn }}>
              إغلاق الجلسة
            </button>
          )}
          <button onClick={handleLogout} style={{ ...styles.button, ...styles.dangerBtn }}>تسجيل الخروج</button>
        </div>
      </header>

      <main style={styles.main}>
        <div style={styles.posTypeSelector}>
          <div 
            style={{ 
              ...styles.posTypeTab, 
              ...(posType === 'sale' ? styles.posTypeTabActive : {}),
              ...(!canAccessSales() ? styles.posTypeTabDisabled : {})
            }} 
            onClick={() => canAccessSales() && setPosType('sale')}>
            🛒 نقطة البيع
          </div>
          <div 
            style={{ 
              ...styles.posTypeTab, 
              ...(posType === 'return' ? styles.posTypeTabActive : {}),
              ...(!canAccessReturns() ? styles.posTypeTabDisabled : {})
            }} 
            onClick={() => canAccessReturns() && setPosType('return')}>
            ↩️ المرتجعات
          </div>
        </div>

        {!canAccessSales() && posType === 'sale' && (
          <div style={styles.warningBox}>⚠️ ليس لديك صلاحية للوصول إلى المبيعات. اتصل بالمدير.</div>
        )}

        {!canAccessReturns() && posType === 'return' && (
          <div style={styles.warningBox}>⚠️ ليس لديك صلاحية للوصول إلى المرتجعات. اتصل بالمدير.</div>
        )}

        {posType === 'return' && canAccessReturns() ? (
          <ReturnPOS session={session} companyInfo={companyInfo} showMessage={showMessage} />
        ) : posType === 'sale' && canAccessSales() ? (
          <>
            <div style={styles.tabs}>
              {['pos', 'products', 'import'].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} style={{ ...styles.tab, ...(activeTab === tab ? styles.tabActive : {}) }}>
                  {tab === 'pos' ? '🛒 نقطة البيع' : tab === 'products' ? '📦 المنتجات' : '📤 استيراد'}
                </button>
              ))}
              <button onClick={handleRefreshData} style={styles.refreshBtn} disabled={loading}>🔄 تحديث البيانات</button>
              
              {/* Customer Display Button - Opens in new window/screen fullscreen */}
              <button 
                onClick={async () => {
                  if (customerDisplayWindow && !customerDisplayWindow.closed) {
                    customerDisplayWindow.focus();
                    return;
                  }

                  try {
                    if ('getScreenDetails' in window) {
                      const details = await window.getScreenDetails();
                      const screens = details.screens;

                      if (screens.length > 1) {
                        const currentX = window.screenX;
                        const currentY = window.screenY;

                        let currentScreenIndex = 0;
                        for (let i = 0; i < screens.length; i++) {
                          const s = screens[i];
                          if (
                            currentX >= s.left &&
                            currentX < s.left + s.width &&
                            currentY >= s.top &&
                            currentY < s.top + s.height
                          ) {
                            currentScreenIndex = i;
                            break;
                          }
                        }

                        const targetScreenIndex = currentScreenIndex === 0 ? 1 : 0;
                        const targetScreen = screens[targetScreenIndex];

                        const displayWindow = window.open(
                          '/customer-display',
                          'CustomerDisplay',
                          `width=${targetScreen.width},height=${targetScreen.height},left=${targetScreen.left},top=${targetScreen.top},fullscreen=yes,resizable=no,toolbar=no,menubar=no,scrollbars=no,status=no`
                        );

                        if (displayWindow) {
                          setCustomerDisplayWindow(displayWindow);
                        }
                        return;
                      }
                    }
                  } catch (err) {
                    console.warn('getScreenDetails failed, falling back:', err);
                  }

                  // Fallback: single screen or API not available
                  const displayWindow = window.open(
                    '/customer-display',
                    'CustomerDisplay',
                    `width=${screen.width},height=${screen.height},fullscreen=yes,location=no,menubar=no,toolbar=no,status=no`
                  );
                  if (displayWindow) {
                    try {
                      displayWindow.moveTo(0, 0);
                      displayWindow.resizeTo(screen.width, screen.height);
                    } catch (e) {
                      console.log('Could not resize window:', e);
                    }
                    setCustomerDisplayWindow(displayWindow);
                  }
                }}
                style={{ ...styles.button, ...styles.primaryBtn, marginLeft: 'auto' }}>
                📺 شاشة العميل
              </button>
            </div>

            {activeTab === 'pos' && (
              <div style={styles.posLayout}>
                <div style={styles.panel}>
                  <input style={styles.input} placeholder="امسح الباركود أو أدخل رمز المنتج..." value={barcode} onChange={e => setBarcode(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleAddByBarcode()} autoFocus />
                  <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                    <div style={{ fontSize: '64px', marginBottom: '15px' }}>🔍</div>
                    <p style={{ fontSize: '16px', marginBottom: '5px', fontWeight: 'bold' }}>امسح أو أدخل الباركود</p>
                    <p style={{ fontSize: '13px', color: '#bbb' }}>محسّن لـ {products.length.toLocaleString()} منتج</p>
                  </div>
                </div>

                <div style={styles.panel}>
                  <h3 style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between' }}>
                    <span>سلة التسوق</span>
                    {cart.length > 0 && <span style={{ ...styles.badge, background: '#2563eb' }}>{cart.length} عناصر</span>}
                  </h3>

                  {cart.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}><p>السلة فارغة</p></div>
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
                                <button style={{ background: 'transparent', border: 'none', color: '#dc3545', cursor: 'pointer', fontSize: '11px', padding: '2px 5px' }} onClick={() => removeFromCart(item.barcode)}>حذف</button>
                              </div>
                            </div>
                          ))}
                        </div>

                        {hasUnresolvedConflicts() && (
                          <div style={{ background: 'rgba(255, 193, 7, 0.2)', border: '2px solid #ffc107', borderRadius: '10px', padding: '12px', marginBottom: '10px', textAlign: 'center' }}>
                            <div style={{ fontWeight: 'bold', color: '#856404', marginBottom: '5px' }}>⚠️ إجراء مطلوب</div>
                            <div style={{ fontSize: '12px', color: '#856404' }}>عروض ترويجية متعددة للمنتجات المجانية - يرجى اختيار واحد</div>
                          </div>
                        )}

                        <div style={{ borderTop: '2px solid #333', paddingTop: '8px' }}>
                          {totals.sections.map((sec, idx) => (
                            <div key={idx} style={{ marginBottom: '10px', paddingBottom: '8px', borderBottom: '1px dashed #bbb' }}>
                              <div style={{ fontWeight: 'bold', fontSize: '13px', color: '#333', marginBottom: '4px' }}>{sec.loyaltyName}</div>
                              <div style={{ fontSize: '11px', color: '#555', marginBottom: '5px' }}>
                                {sec.type === 1 
                                  ? `Buy ${sec.triggerItems[0]?.quantity || 0} Get ${sec.rewardItems[0]?.freeQty || 0} Free / اشتر واحصل مجاناً` 
                                  : sec.afterDiscount 
                                    ? `${sec.triggerItems.reduce((s, ti) => s + ti.quantity, 0)} for ${fc(sec.afterDiscount)} / ${sec.triggerItems.reduce((s, ti) => s + ti.quantity, 0)} بـ ${fc(sec.afterDiscount)}`
                                    : `${sec.discountPercent}% Off / ${sec.discountPercent}% خصم`}
                              </div>
                              {sec.triggerItems.map((ti, i) => (
                                <div key={`t${i}`} style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 8px', fontSize: '12px', color: '#333' }}>
                                  <span>{ti.loyaltyLabel || ti.name} x {ti.quantity}</span>
                                  <span>{ti.afterDiscountPrice ? fc(ti.afterDiscountPrice * ti.quantity) : fc(ti.lineTotal)}</span>
                                </div>
                              ))}
                              {sec.rewardItems.filter(ri => ri.barcode !== '_group_discount_').map((ri, i) => (
                                <div key={`r${i}`} style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 8px', fontSize: '12px', color: '#333' }}>
                                  <span>{ri.name} x {ri.quantity}</span><span>{sec.type === 1 ? fc(0) : fc(ri.lineTotal)}</span>
                                </div>
                              ))}
                              {sec.type === 0 && sec.totalDiscount > 0 && !sec.afterDiscount && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 8px', fontSize: '12px', color: '#28a745', fontWeight: 'bold' }}>
                                  <span>💚 Discount</span><span>{fcNeg(sec.totalDiscount)}</span>
                                </div>
                              )}
                              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 8px', fontSize: '12px', fontWeight: 'bold', color: '#333', borderTop: '1px solid #ddd', marginTop: '3px' }}>
                                <span>Subtotal</span><span>{fc(sec.sectionSubtotal)}</span>
                              </div>
                            </div>
                          ))}

                          {totals.remainingItems.length > 0 && (
                            <div style={{ marginBottom: '10px', paddingBottom: '8px', borderBottom: '1px dashed #bbb' }}>
                              {totals.sections.length > 0 && <div style={{ fontWeight: 'bold', fontSize: '13px', color: '#333', marginBottom: '4px' }}>عناصر أخرى</div>}
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
                          <span>المجموع الفرعي</span><span>{fc(totals.subtotal)}</span>
                        </div>
                        {totals.totalDiscount > 0 && (
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '14px', color: '#333' }}>
                            <span>الخصم</span><span>{fcNeg(totals.totalDiscount)}</span>
                          </div>
                        )}
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '14px', color: '#666' }}>
                          <span>الضريبة</span><span>{fc(totals.totalTax)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '20px', fontWeight: 'bold', color: '#2563eb', paddingTop: '8px', borderTop: '2px solid #333' }}>
                          <span>الإجمالي</span><span>{fc(totals.total)}</span>
                        </div>
                      </div>

                      <button
                        style={{ ...styles.button, ...styles.primaryBtn, width: '100%', marginTop: '15px', padding: '15px', fontSize: '16px', 
                          ...(hasUnresolvedConflicts() ? { background: '#ffc107', color: '#000' } : {}) }}
                        onClick={() => {
                          if (hasUnresolvedConflicts()) { 
                            const c = detectConflicts(cart); 
                            for (const x of c) { if (!selectionsRef.current[x.conflictKey]) { setShowConflictModal(x); return; } } 
                          }
                          else handleCheckout();
                        }} 
                        disabled={loading}>
                        {hasUnresolvedConflicts() ? '⚠️ اختر المنتج المجاني أولاً' : 'المتابعة للدفع'}
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'products' && (
              <div style={styles.panel}>
                <h3 style={{ marginBottom: '20px' }}>المنتجات ({products.length.toLocaleString()})</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead><tr style={{ background: '#f8f9fa' }}>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e0e0e0' }}>الباركود</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e0e0e0' }}>الاسم</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e0e0e0' }}>الفئة</th>
                    <th style={{ padding: '12px', textAlign: 'right', borderBottom: '2px solid #e0e0e0' }}>السعر</th>
                    <th style={{ padding: '12px', textAlign: 'right', borderBottom: '2px solid #e0e0e0' }}>الضريبة</th>
                  </tr></thead>
                  <tbody>
                    {products.slice(0, 100).map(p => (
                      <tr key={p.barcode} style={{ borderBottom: '1px solid #e0e0e0' }}>
                        <td style={{ padding: '12px' }}><code style={{ background: '#f0f0f0', padding: '3px 8px', borderRadius: '4px' }}>{p.barcode}</code></td>
                        <td style={{ padding: '12px' }}>{p.name}</td>
                        <td style={{ padding: '12px' }}><span style={{ background: '#e0e7ff', color: '#2563eb', padding: '3px 10px', borderRadius: '15px', fontSize: '12px' }}>{p.category}</span></td>
                        <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold', color: '#2563eb' }}>{fc(p.price)}</td>
                        <td style={{ padding: '12px', textAlign: 'right', color: '#666' }}>{((p.taxRate || 0) * 100).toFixed(0)}%</td>
                      </tr>
                    ))}
                    {products.length > 100 && (
                      <tr>
                        <td colSpan="5" style={{ padding: '20px', textAlign: 'center', color: '#999', fontStyle: 'italic' }}>
                          عرض أول 100 منتج. استخدم ماسح الباركود للعثور على منتجات محددة.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'import' && (
              <div style={styles.panel}>
                <h3 style={{ marginBottom: '20px' }}>استيراد البيانات من Excel</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  {[{ type: 'products', label: 'استيراد المنتجات' }, { type: 'loyalty', label: 'استيراد برامج الولاء' }].map(({ type, label }) => (
                    <div key={type} style={{ padding: '30px', border: '2px dashed #e0e0e0', borderRadius: '15px', textAlign: 'center' }}>
                      <h4>{label}</h4>
                      <p style={{ color: '#666', marginBottom: '15px' }}>{type === 'loyalty' ? 'تحميل ملف CSV أو Excel (.csv, .xlsx)' : 'تحميل ملف Excel (.xlsx)'}</p>
                      <input type="file" accept={type === 'loyalty' ? '.xlsx,.xls,.csv' : '.xlsx,.xls'} onChange={e => e.target.files[0] && handleFileImport(type, e.target.files[0])} style={{ display: 'none' }} id={`${type}File`} />
                      <label htmlFor={`${type}File`} style={{ ...styles.button, ...styles.primaryBtn, cursor: 'pointer', display: 'inline-block' }}>اختر ملف</label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : null}
      </main>

      {showCustomerInfo && (
        <div style={styles.modal} onClick={() => setShowCustomerInfo(false)}>
          <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <h2 style={{ textAlign: 'center', marginBottom: '10px' }}>Customer Information</h2>
            <p style={{ textAlign: 'center', color: '#666', fontSize: '14px', marginBottom: '20px' }}>معلومات العميل / Required</p>

            <div style={styles.phoneInputContainer}>
              <div style={styles.phonePrefix}>+966</div>
              <input type="tel" placeholder="5XXXXXXXX (Required / مطلوب) *" value={customerInfo.phone}
                onChange={e => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 9);
                  setCustomerInfo({ ...customerInfo, phone: value });
                  if (value && validationErrors.phone) { setValidationErrors({ ...validationErrors, phone: '' }); }
                }}
                style={{ ...styles.input, marginBottom: 0, flex: 1, ...(validationErrors.phone ? styles.inputError : {}) }}
                maxLength={9} autoFocus />
            </div>
            {validationErrors.phone && <div style={styles.errorText}>⚠️ {validationErrors.phone}</div>}

            <div style={styles.checkboxContainer}
              onClick={() => {
                const newNeedsVat = !customerInfo.needsVat;
                setCustomerInfo({ ...customerInfo, needsVat: newNeedsVat, vat: newNeedsVat ? customerInfo.vat : '' });
                if (!newNeedsVat) { setValidationErrors({ ...validationErrors, vat: '' }); }
              }}>
              <input type="checkbox" checked={customerInfo.needsVat} onChange={() => {}} style={styles.checkbox} />
              <label style={{ cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' }}>
                🧾 Request Tax Invoice (VAT) / طلب فاتورة ضريبية
              </label>
            </div>

            {customerInfo.needsVat && (
              <>
                <input type="text" placeholder="VAT Number - 15 digits / الرقم الضريبي (15 رقم) *" value={customerInfo.vat}
                  onChange={e => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 15);
                    setCustomerInfo({ ...customerInfo, vat: value });
                    if (value && validationErrors.vat) { setValidationErrors({ ...validationErrors, vat: '' }); }
                  }}
                  style={{ ...styles.input, ...(validationErrors.vat ? styles.inputError : {}) }} maxLength={15} />
                {validationErrors.vat && <div style={styles.errorText}>⚠️ {validationErrors.vat}</div>}
                <div style={{ background: '#e3f2fd', border: '1px solid #2196f3', borderRadius: '8px', padding: '12px', marginBottom: '15px', fontSize: '12px', color: '#1565c0' }}>
                  <strong>ℹ️ Note:</strong> Tax Invoice requires valid 15-digit Saudi VAT number<br />
                  <strong>ملاحظة:</strong> الفاتورة الضريبية تتطلب رقم ضريبي سعودي صحيح من 15 رقم
                </div>
              </>
            )}

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button onClick={() => setShowCustomerInfo(false)} style={{ ...styles.button, flex: 1, background: '#6c757d', color: '#fff' }}>Cancel / إلغاء</button>
              <button onClick={proceedToPayment} style={{ ...styles.button, ...styles.primaryBtn, flex: 1 }}>Continue / متابعة</button>
            </div>
          </div>
        </div>
      )}

      {showPayment && (
        <div style={styles.modal} onClick={() => setShowPayment(false)}>
          <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <h2 style={{ textAlign: 'center', marginBottom: '10px' }}>إتمام الدفع</h2>
            <div style={{ textAlign: 'center', fontSize: '36px', fontWeight: 'bold', color: '#2563eb', marginBottom: '25px' }}>{fc(totals.total)}</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
              <button style={{ padding: '25px', borderRadius: '15px', border: '2px solid #e0e0e0', background: '#fff', cursor: 'pointer', fontSize: '18px', fontWeight: 'bold' }}
                onClick={() => handlePayment('CASH')} disabled={loading}>💵 نقدي</button>
              <button style={{ padding: '25px', borderRadius: '15px', border: '2px solid #e0e0e0', background: '#fff', cursor: 'pointer', fontSize: '18px', fontWeight: 'bold' }}
                onClick={() => handlePayment('CARD')} disabled={loading}>💳 بطاقة</button>
            </div>
            <button style={{ width: '100%', padding: '15px', borderRadius: '10px', border: '1px solid #e0e0e0', background: '#fff', cursor: 'pointer' }}
              onClick={() => setShowPayment(false)}>إلغاء</button>
          </div>
        </div>
      )}

      {showConflictModal && (
        <div style={styles.modal}>
          <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <h3 style={{ textAlign: 'center', marginBottom: '10px', color: '#333', fontSize: '22px' }}>🎁 اختر المنتج المجاني</h3>
            <p style={{ textAlign: 'center', color: '#666', marginBottom: '8px', fontSize: '14px' }}>
              عروض ترويجية متعددة للمنتجات المجانية لـ <strong>{showConflictModal.triggerProduct}</strong>
            </p>
            <p style={{ textAlign: 'center', color: '#999', marginBottom: '20px', fontSize: '12px' }}>اختر المنتج الذي تريد الحصول عليه مجاناً:</p>
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
                      <div style={{ fontSize: '13px', color: '#28a745', marginBottom: '6px', fontWeight: 'bold' }}>احصل مجاناً على: {opt.rewardProducts.map(rp => rp.name).join(', ')}</div>
                      <div style={{ fontSize: '12px', color: '#888' }}>القيمة: {opt.rewardProducts.map(rp => fc(rp.price)).join(', ')}</div>
                    </div>
                    <div style={{ textAlign: 'right', marginLeft: '15px' }}>
                      <div style={{ fontSize: '11px', color: '#888', marginBottom: '3px' }}>توفر</div>
                      <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#28a745' }}>{fc(opt.potentialSavings)}</div>
                    </div>
                  </div>
                  <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px dashed #e0e0e0', textAlign: 'center', fontSize: '13px', fontWeight: 'bold', color: '#28a745' }}>
                    ← اضغط للاختيار
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