import React, { useState, useEffect } from 'react';
import CustomerDisplay from './components/CustomerDisplay';

/**
 * CustomerDisplayPage - Fullscreen customer-facing display
 * 
 * This page is opened in a new window (typically on a second screen)
 * and receives live updates from the main POS window via window.opener
 */
function CustomerDisplayPage() {
  const [cart, setCart] = useState([]);
  const [totals, setTotals] = useState({
    subtotal: 0,
    totalTax: 0,
    totalDiscount: 0,
    total: 0,
    sections: [],
    remainingItems: []
  });
  const [companyInfo, setCompanyInfo] = useState({
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
  });

  useEffect(() => {
    // Try to make fullscreen on load
    const goFullscreen = () => {
      const elem = document.documentElement;
      if (elem.requestFullscreen) {
        elem.requestFullscreen().catch(err => console.log('Fullscreen request failed:', err));
      } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen();
      } else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen();
      }
    };

    // Small delay to ensure DOM is ready
    setTimeout(goFullscreen, 100);

    // Listen for updates from the main POS window
    const handleMessage = (event) => {
      // Security: Verify the message is from the same origin
      if (event.origin !== window.location.origin) return;

      const { type, data } = event.data;

      switch (type) {
        case 'UPDATE_CART':
          setCart(data.cart);
          break;
        case 'UPDATE_TOTALS':
          setTotals(data.totals);
          break;
        case 'UPDATE_COMPANY_INFO':
          setCompanyInfo(data.companyInfo);
          break;
        case 'UPDATE_ALL':
          if (data.cart) setCart(data.cart);
          if (data.totals) setTotals(data.totals);
          if (data.companyInfo) setCompanyInfo(data.companyInfo);
          break;
        default:
          break;
      }
    };

    window.addEventListener('message', handleMessage);

    // Request initial data from opener
    if (window.opener && !window.opener.closed) {
      window.opener.postMessage({ type: 'REQUEST_CUSTOMER_DISPLAY_DATA' }, window.location.origin);
    }

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#1a1a2e',
      overflow: 'hidden'
    }}>
      <CustomerDisplay 
        cart={cart}
        totals={totals}
        companyInfo={companyInfo}
      />
    </div>
  );
}

export default CustomerDisplayPage;