import React from 'react';

const styles = {
  cart: {
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '15px',
    padding: '20px',
    border: '1px solid rgba(255,255,255,0.1)',
    height: 'fit-content',
  },
  title: {
    fontSize: '20px',
    fontWeight: 'bold',
    marginBottom: '20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemCount: {
    background: '#e94560',
    padding: '3px 10px',
    borderRadius: '15px',
    fontSize: '14px',
  },
  emptyCart: {
    textAlign: 'center',
    padding: '40px 20px',
    color: 'rgba(255,255,255,0.5)',
  },
  cartItem: {
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '10px',
    padding: '15px',
    marginBottom: '10px',
    transition: 'background 0.2s',
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
  },
  itemPrice: {
    color: '#e94560',
    fontWeight: 'bold',
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
  qtyBtn: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    border: 'none',
    background: '#e94560',
    color: '#fff',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'transform 0.1s',
  },
  quantity: {
    minWidth: '30px',
    textAlign: 'center',
    fontSize: '16px',
  },
  removeBtn: {
    background: 'transparent',
    border: 'none',
    color: '#dc3545',
    cursor: 'pointer',
    fontSize: '12px',
    padding: '5px',
  },
  promoTag: {
    display: 'inline-block',
    background: '#28a745',
    padding: '2px 8px',
    borderRadius: '5px',
    fontSize: '11px',
    marginTop: '8px',
    marginRight: '5px',
  },
  freeTag: {
    display: 'inline-block',
    background: '#17a2b8',
    padding: '2px 8px',
    borderRadius: '5px',
    fontSize: '11px',
    marginTop: '8px',
    marginRight: '5px',
  },
  summary: {
    borderTop: '1px solid rgba(255,255,255,0.2)',
    paddingTop: '20px',
    marginTop: '20px',
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '12px',
    fontSize: '14px',
  },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '22px',
    fontWeight: 'bold',
    color: '#e94560',
    paddingTop: '15px',
    borderTop: '2px solid rgba(255,255,255,0.2)',
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
    background: 'linear-gradient(90deg, #e94560, #ff6b6b)',
    color: '#fff',
    marginTop: '20px',
    transition: 'transform 0.2s',
  },
  disabledBtn: {
    background: 'rgba(255,255,255,0.2)',
    cursor: 'not-allowed',
  },
  discountText: {
    color: '#28a745',
  },
  taxText: {
    color: 'rgba(255,255,255,0.7)',
  },
};

const Cart = ({
  items,
  totals,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
  loading,
}) => {
  const { subtotal, totalDiscount, totalTax, total, itemDetails } = totals;

  return (
    <div style={styles.cart}>
      <div style={styles.title}>
        <span>Shopping Cart</span>
        {items.length > 0 && (
          <span style={styles.itemCount}>{items.length} items</span>
        )}
      </div>

      {items.length === 0 ? (
        <div style={styles.emptyCart}>
          <div style={{ fontSize: '48px', marginBottom: '15px' }}>🛒</div>
          <p>Cart is empty</p>
          <p style={{ fontSize: '12px', marginTop: '5px' }}>
            Scan a barcode or click a product to add
          </p>
        </div>
      ) : (
        <>
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {itemDetails.map((item) => (
              <div key={item.barcode} style={styles.cartItem}>
                <div style={styles.itemHeader}>
                  <div>
                    <div style={styles.itemName}>{item.name}</div>
                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>
                      ${item.price.toFixed(2)} each
                    </div>
                  </div>
                  <div style={styles.itemPrice}>
                    ${item.itemSubtotal.toFixed(2)}
                  </div>
                </div>

                <div style={styles.itemDetails}>
                  <div style={styles.quantityControl}>
                    <button
                      style={styles.qtyBtn}
                      onClick={() => onUpdateQuantity(item.barcode, -1)}
                    >
                      −
                    </button>
                    <span style={styles.quantity}>{item.quantity}</span>
                    <button
                      style={styles.qtyBtn}
                      onClick={() => onUpdateQuantity(item.barcode, 1)}
                    >
                      +
                    </button>
                  </div>
                  <button
                    style={styles.removeBtn}
                    onClick={() => onRemoveItem(item.barcode)}
                  >
                    Remove
                  </button>
                </div>

                {/* Promotions applied */}
                {item.promos && item.promos.length > 0 && (
                  <div>
                    {item.promos.map((promo, idx) => (
                      <span
                        key={idx}
                        style={promo.type === 'BOGO' ? styles.freeTag : styles.promoTag}
                      >
                        {promo.type === 'BOGO'
                          ? `🎁 ${promo.freeItems} FREE`
                          : `💰 ${promo.name}`}
                      </span>
                    ))}
                  </div>
                )}

                {/* Item discount */}
                {item.itemDiscount > 0 && (
                  <div style={{ fontSize: '12px', color: '#28a745', marginTop: '5px' }}>
                    Savings: -${item.itemDiscount.toFixed(2)}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Summary */}
          <div style={styles.summary}>
            <div style={styles.summaryRow}>
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            
            {totalDiscount > 0 && (
              <div style={{ ...styles.summaryRow, ...styles.discountText }}>
                <span>Discount</span>
                <span>-${totalDiscount.toFixed(2)}</span>
              </div>
            )}
            
            <div style={{ ...styles.summaryRow, ...styles.taxText }}>
              <span>Tax</span>
              <span>${totalTax.toFixed(2)}</span>
            </div>
            
            <div style={styles.totalRow}>
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

          <button
            style={{
              ...styles.checkoutBtn,
              ...(loading ? styles.disabledBtn : {}),
            }}
            onClick={onCheckout}
            disabled={loading || items.length === 0}
          >
            {loading ? 'Processing...' : 'Proceed to Payment'}
          </button>
        </>
      )}
    </div>
  );
};

export default Cart;
