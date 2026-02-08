import React, { useState } from 'react';
import axios from 'axios';
import { printReceipt } from './receiptPrinter';

const API_URL = 'http://localhost:8080/api';

const fc = (amount) => `${amount.toFixed(2)} ﷼`;

const ReturnPOS = ({ session, companyInfo, showMessage }) => {
  const [searchType, setSearchType] = useState('orderNumber'); // orderNumber, phone, total
  const [searchValue, setSearchValue] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [returnItems, setReturnItems] = useState([]);
  const [returnReason, setReturnReason] = useState('');
  const [loading, setLoading] = useState(false);

  const styles = {
    container: { maxWidth: '1400px', margin: '0 auto' },
    searchPanel: { background: '#fff', borderRadius: '15px', padding: '25px', marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
    searchTabs: { display: 'flex', gap: '10px', marginBottom: '20px' },
    searchTab: { padding: '10px 20px', borderRadius: '8px', border: '2px solid #e0e0e0', background: '#fff', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold', transition: 'all 0.3s' },
    searchTabActive: { background: '#2563eb', color: '#fff', borderColor: '#2563eb' },
    input: { width: '100%', padding: '15px', borderRadius: '10px', border: '2px solid #e0e0e0', fontSize: '16px', marginBottom: '15px' },
    button: { padding: '12px 30px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.3s' },
    primaryBtn: { background: '#2563eb', color: '#fff' },
    dangerBtn: { background: '#dc3545', color: '#fff' },
    successBtn: { background: '#28a745', color: '#fff' },
    resultsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '15px', marginTop: '20px' },
    orderCard: { background: '#f8f9fa', borderRadius: '12px', padding: '20px', border: '2px solid #e0e0e0', cursor: 'pointer', transition: 'all 0.3s' },
    orderCardSelected: { borderColor: '#2563eb', background: '#e0e7ff' },
    detailsPanel: { background: '#fff', borderRadius: '15px', padding: '25px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
    itemRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', borderBottom: '1px solid #e0e0e0' },
    checkbox: { width: '20px', height: '20px', cursor: 'pointer' },
    table: { width: '100%', borderCollapse: 'collapse', marginTop: '15px' },
    th: { padding: '12px', textAlign: 'left', borderBottom: '2px solid #e0e0e0', background: '#f8f9fa', fontWeight: 'bold' },
    td: { padding: '12px', borderBottom: '1px solid #e0e0e0' },
  };

  const handleSearch = async () => {
    if (!searchValue.trim()) {
      showMessage('Please enter a search value');
      return;
    }

    setLoading(true);
    try {
      const searchDTO = {};
      
      if (searchType === 'orderNumber') {
        searchDTO.orderNumber = searchValue;
      } else if (searchType === 'phone') {
        searchDTO.customerPhone = searchValue;
      } else if (searchType === 'total') {
        const amount = parseFloat(searchValue);
        if (isNaN(amount)) {
          showMessage('Please enter a valid amount');
          setLoading(false);
          return;
        }
        searchDTO.totalAmountMin = amount - 5; // Search with ±5 range
        searchDTO.totalAmountMax = amount + 5;
      }

      searchDTO.orderType = 'SALE'; // Only search for sale orders to return

      const response = await axios.post(`${API_URL}/orders/search`, searchDTO);
      setSearchResults(response.data);
      
      if (response.data.length === 0) {
        showMessage('No orders found');
      } else {
        showMessage(`Found ${response.data.length} order(s)`);
      }
    } catch (error) {
      console.error('Search error:', error);
      showMessage('Error searching orders');
    } finally {
      setLoading(false);
    }
  };

  const selectOrder = (order) => {
    setSelectedOrder(order);
    // Initialize return items with all items unchecked
    const items = order.items.map(item => ({
      ...item,
      checked: false,
      returnQty: 0,
    }));
    setReturnItems(items);
  };

  const toggleItemReturn = (index) => {
    const newItems = [...returnItems];
    const item = newItems[index];
    
    // Check if this item is part of a promotion
    if (item.promotionName && item.promotionName.trim()) {
      // Check if there are other items in the same promotion
      const promotionItems = newItems.filter(i => i.promotionName === item.promotionName);
      
      if (promotionItems.length > 1) {
        // Toggle all items in this promotion
        const newCheckedState = !item.checked;
        promotionItems.forEach(promItem => {
          const idx = newItems.findIndex(i => i.id === promItem.id);
          if (idx !== -1) {
            newItems[idx].checked = newCheckedState;
            newItems[idx].returnQty = newCheckedState ? Math.abs(promItem.quantity) : 0;
          }
        });
        showMessage(`All items in promotion "${item.promotionName}" ${newCheckedState ? 'selected' : 'deselected'}`);
      } else {
        // Single item, toggle normally
        item.checked = !item.checked;
        item.returnQty = item.checked ? Math.abs(item.quantity) : 0;
      }
    } else {
      // No promotion, toggle normally
      item.checked = !item.checked;
      item.returnQty = item.checked ? Math.abs(item.quantity) : 0;
    }
    
    setReturnItems(newItems);
  };

  const updateReturnQty = (index, qty) => {
    const newItems = [...returnItems];
    const maxQty = Math.abs(newItems[index].quantity);
    newItems[index].returnQty = Math.min(Math.max(0, qty), maxQty);
    newItems[index].checked = newItems[index].returnQty > 0;
    setReturnItems(newItems);
  };

  const processReturn = async () => {
    const itemsToReturn = returnItems.filter(item => item.checked && item.returnQty > 0);
    
    if (itemsToReturn.length === 0) {
      showMessage('Please select items to return');
      return;
    }

    if (!returnReason.trim()) {
      showMessage('Please enter a return reason');
      return;
    }

    setLoading(true);
    try {
      const returnDTO = {
        items: itemsToReturn.map(item => {
          const originalQty = Math.abs(item.quantity);
          const itemTotalDiscount = item.discount || 0;
          // Proportionally scale discount based on returned qty
          const proportionalDiscount = originalQty > 0 ? (itemTotalDiscount / originalQty) * item.returnQty : 0;
          return {
            barcode: item.product?.barcode || item.productName,
            quantity: item.returnQty,
            price: item.unitPrice,
            discount: proportionalDiscount,
            promotionName: item.promotionName || null,
            isReward: item.isReward || false,
          };
        }),
        paymentMethod: selectedOrder.paymentMethod,
        notes: `Return for order ${selectedOrder.orderNumber}`,
        customerName: selectedOrder.customerName,
        customerPhone: selectedOrder.customerPhone,
        customerVat: selectedOrder.customerVat,
        orderType: 'RETURN',
        originalOrderNumber: selectedOrder.orderNumber,
        returnReason: returnReason,
      };

      const response = await axios.post(`${API_URL}/orders/session/${session.id}`, returnDTO);
      
      // Build and print return receipt
      const returnTotals = calculateReturnTotal();
      const returnReceiptOrder = {
        orderNumber: response.data?.orderNumber || `RET-${selectedOrder.orderNumber}`,
        subtotal: returnTotals.subtotal,
        taxAmount: returnTotals.tax,
        totalAmount: returnTotals.total,
        discountAmount: returnTotals.discount,
        paymentMethod: selectedOrder.paymentMethod,
        cashierName: session.cashierName,
        createdAt: new Date().toISOString(),
        amountPaid: returnTotals.total,
        change: 0,
        customerName: selectedOrder.customerName,
        customerPhone: selectedOrder.customerPhone,
        customerVat: selectedOrder.customerVat,
        isReturn: true,
        originalOrderNumber: selectedOrder.orderNumber,
        returnReason: returnReason,
        loyaltySections: [],
        remainingItems: itemsToReturn.map(item => ({
          name: item.productName,
          barcode: item.product?.barcode || item.productName,
          price: item.unitPrice,
          quantity: item.returnQty,
          itemSubtotal: item.unitPrice * item.returnQty,
          discount: item.discount || 0,
          promotionName: item.promotionName || null,
        })),
      };
      
      printReceipt(returnReceiptOrder, companyInfo);
      
      showMessage('Return processed successfully!');
      
      // Reset state
      setSelectedOrder(null);
      setReturnItems([]);
      setReturnReason('');
      setSearchResults([]);
      setSearchValue('');
      
      // Could show a receipt here similar to OrderComplete
      console.log('Return order created:', response.data);
      
    } catch (error) {
      console.error('Return error:', error);
      showMessage('Error processing return');
    } finally {
      setLoading(false);
    }
  };

  const calculateReturnTotal = () => {
    const itemsToReturn = returnItems.filter(item => item.checked && item.returnQty > 0);
    
    let subtotal = 0;
    let discount = 0;
    let tax = 0;

    itemsToReturn.forEach(item => {
      const lineTotal = item.unitPrice * item.returnQty;
      subtotal += lineTotal;
      
      // Calculate discount proportionally based on return qty vs original qty
      const originalQty = Math.abs(item.quantity);
      const itemTotalDiscount = item.discount || 0;
      if (originalQty > 0 && itemTotalDiscount > 0) {
        discount += (itemTotalDiscount / originalQty) * item.returnQty;
      }
    });

    const taxableAmount = subtotal - discount;
    tax = taxableAmount * 0.15; // 15% VAT

    const total = subtotal - discount + tax;

    return { subtotal, discount, tax, total };
  };

  const totals = selectedOrder ? calculateReturnTotal() : { subtotal: 0, discount: 0, tax: 0, total: 0 };

  return (
    <div style={styles.container}>
      {/* Search Panel */}
      <div style={styles.searchPanel}>
        <h2 style={{ marginBottom: '20px' }}>🔍 Search Orders to Return</h2>
        
        <div style={styles.searchTabs}>
          <button
            style={{ ...styles.searchTab, ...(searchType === 'orderNumber' ? styles.searchTabActive : {}) }}
            onClick={() => setSearchType('orderNumber')}
          >
            📋 Order Number
          </button>
          <button
            style={{ ...styles.searchTab, ...(searchType === 'phone' ? styles.searchTabActive : {}) }}
            onClick={() => setSearchType('phone')}
          >
            📱 Phone Number
          </button>
          <button
            style={{ ...styles.searchTab, ...(searchType === 'total' ? styles.searchTabActive : {}) }}
            onClick={() => setSearchType('total')}
          >
            💰 Total Amount
          </button>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type={searchType === 'total' ? 'number' : 'text'}
            placeholder={
              searchType === 'orderNumber' ? 'Enter order number...' :
              searchType === 'phone' ? 'Enter phone number...' :
              'Enter total amount...'
            }
            value={searchValue}
            onChange={e => setSearchValue(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && handleSearch()}
            style={styles.input}
          />
          <button
            onClick={handleSearch}
            disabled={loading}
            style={{ ...styles.button, ...styles.primaryBtn }}
          >
            {loading ? '🔍 Searching...' : '🔍 Search'}
          </button>
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div style={styles.resultsGrid}>
            {searchResults.map(order => (
              <div
                key={order.id}
                style={{
                  ...styles.orderCard,
                  ...(selectedOrder?.id === order.id ? styles.orderCardSelected : {}),
                }}
                onClick={() => selectOrder(order)}
              >
                <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '10px' }}>
                  {order.orderNumber}
                </div>
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
                  📅 {new Date(order.createdAt).toLocaleString()}
                </div>
                {order.customerName && (
                  <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>
                    👤 {order.customerName}
                  </div>
                )}
                {order.customerPhone && (
                  <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>
                    📱 {order.customerPhone}
                  </div>
                )}
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#2563eb', marginTop: '10px' }}>
                  {fc(order.totalAmount)}
                </div>
                <div style={{ marginTop: '10px', fontSize: '12px', color: '#888' }}>
                  {order.items?.length || 0} items • {order.paymentMethod}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Order Details and Return Processing */}
      {selectedOrder && (
        <div style={styles.detailsPanel}>
          <h2 style={{ marginBottom: '20px' }}>↩️ Process Return for {selectedOrder.orderNumber}</h2>
          
          {/* Customer Information */}
          <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '10px', marginBottom: '20px' }}>
            <h3 style={{ marginBottom: '10px', fontSize: '16px' }}>Customer Information</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', fontSize: '14px' }}>
              <div><strong>Name:</strong> {selectedOrder.customerName || 'N/A'}</div>
              <div><strong>Phone:</strong> {selectedOrder.customerPhone || 'N/A'}</div>
              <div><strong>VAT:</strong> {selectedOrder.customerVat || 'N/A'}</div>
            </div>
          </div>

          {/* Items Table */}
          <h3 style={{ marginBottom: '15px', fontSize: '16px' }}>Select Items to Return</h3>
          <p style={{ color: '#666', fontSize: '14px', marginBottom: '15px' }}>
            ⚠️ Note: Items in promotions must be returned together
          </p>
          
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Return</th>
                <th style={styles.th}>Product</th>
                <th style={styles.th}>Original Qty</th>
                <th style={styles.th}>Return Qty</th>
                <th style={styles.th}>Unit Price</th>
                <th style={styles.th}>Promotion</th>
                <th style={styles.th}>Total</th>
              </tr>
            </thead>
            <tbody>
              {returnItems.map((item, index) => (
                <tr key={index}>
                  <td style={styles.td}>
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={() => toggleItemReturn(index)}
                      style={styles.checkbox}
                    />
                  </td>
                  <td style={styles.td}>
                    <div style={{ fontWeight: 'bold' }}>{item.productName}</div>
                    {item.isReward && (
                      <span style={{ fontSize: '12px', color: '#28a745', fontWeight: 'bold' }}>
                        🎁 FREE ITEM
                      </span>
                    )}
                  </td>
                  <td style={styles.td}>{Math.abs(item.quantity)}</td>
                  <td style={styles.td}>
                    <input
                      type="number"
                      min="0"
                      max={Math.abs(item.quantity)}
                      value={item.returnQty}
                      onChange={e => updateReturnQty(index, parseInt(e.target.value) || 0)}
                      style={{ width: '60px', padding: '5px', borderRadius: '5px', border: '1px solid #e0e0e0' }}
                      disabled={!item.checked}
                    />
                  </td>
                  <td style={styles.td}>{fc(item.unitPrice)}</td>
                  <td style={styles.td}>
                    {item.promotionName ? (
                      <span style={{ fontSize: '12px', background: '#e0e7ff', color: '#2563eb', padding: '3px 8px', borderRadius: '10px' }}>
                        {item.promotionName}
                      </span>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td style={{ ...styles.td, fontWeight: 'bold', color: '#2563eb' }}>
                    {fc(item.unitPrice * item.returnQty)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Return Reason */}
          <div style={{ marginTop: '25px' }}>
            <h3 style={{ marginBottom: '10px', fontSize: '16px' }}>Return Reason</h3>
            <textarea
              placeholder="Enter reason for return..."
              value={returnReason}
              onChange={e => setReturnReason(e.target.value)}
              style={{ 
                ...styles.input, 
                minHeight: '80px', 
                fontFamily: 'inherit',
                resize: 'vertical'
              }}
            />
          </div>

          {/* Totals */}
          <div style={{ marginTop: '25px', padding: '20px', background: '#f8f9fa', borderRadius: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span>Subtotal:</span>
              <span style={{ fontWeight: 'bold' }}>{fc(totals.subtotal)}</span>
            </div>
            {totals.discount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', color: '#28a745' }}>
                <span>Discount:</span>
                <span style={{ fontWeight: 'bold' }}>-{fc(totals.discount)}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span>Tax (15%):</span>
              <span style={{ fontWeight: 'bold' }}>{fc(totals.tax)}</span>
            </div>
            <div style={{ borderTop: '2px solid #e0e0e0', paddingTop: '10px', marginTop: '10px', display: 'flex', justifyContent: 'space-between', fontSize: '20px', color: '#dc3545' }}>
              <span style={{ fontWeight: 'bold' }}>Refund Amount:</span>
              <span style={{ fontWeight: 'bold' }}>{fc(totals.total)}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ marginTop: '25px', display: 'flex', gap: '15px', justifyContent: 'flex-end' }}>
            <button
              onClick={() => {
                setSelectedOrder(null);
                setReturnItems([]);
                setReturnReason('');
              }}
              style={{ ...styles.button, background: '#6c757d', color: '#fff' }}
            >
              Cancel
            </button>
            <button
              onClick={processReturn}
              disabled={loading || returnItems.filter(i => i.checked).length === 0}
              style={{ ...styles.button, ...styles.dangerBtn }}
            >
              {loading ? 'Processing...' : '↩️ Process Return'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReturnPOS;
