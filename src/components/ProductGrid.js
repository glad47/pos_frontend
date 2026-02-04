import React from 'react';

const styles = {
  container: {
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '15px',
    padding: '20px',
    border: '1px solid rgba(255,255,255,0.1)',
  },
  searchBox: {
    width: '100%',
    padding: '15px',
    borderRadius: '10px',
    border: '2px solid rgba(255,255,255,0.2)',
    background: 'rgba(255,255,255,0.1)',
    color: '#fff',
    fontSize: '18px',
    outline: 'none',
    marginBottom: '20px',
    boxSizing: 'border-box',
    transition: 'border-color 0.3s',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
    gap: '15px',
  },
  productCard: {
    background: 'rgba(255,255,255,0.08)',
    borderRadius: '12px',
    padding: '15px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    border: '1px solid transparent',
    textAlign: 'center',
  },
  productCardHover: {
    background: 'rgba(255,255,255,0.15)',
    borderColor: '#e94560',
    transform: 'translateY(-2px)',
  },
  productEmoji: {
    fontSize: '32px',
    marginBottom: '8px',
  },
  productName: {
    fontWeight: 'bold',
    fontSize: '14px',
    marginBottom: '5px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  productPrice: {
    color: '#e94560',
    fontWeight: 'bold',
    fontSize: '16px',
  },
  productBarcode: {
    fontSize: '10px',
    color: 'rgba(255,255,255,0.5)',
    marginTop: '5px',
  },
  productStock: {
    fontSize: '11px',
    color: 'rgba(255,255,255,0.6)',
    marginTop: '3px',
  },
  lowStock: {
    color: '#ffc107',
  },
  outOfStock: {
    color: '#dc3545',
  },
  categoryLabel: {
    display: 'inline-block',
    background: 'rgba(233, 69, 96, 0.2)',
    color: '#e94560',
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '10px',
    marginTop: '5px',
  },
};

const categoryEmojis = {
  Beverages: '☕',
  Bakery: '🥐',
  Food: '🥪',
  Snacks: '🍪',
  default: '📦',
};

const ProductGrid = ({ products, onAddToCart, barcode, onBarcodeChange, onBarcodeSubmit }) => {
  const [hoveredProduct, setHoveredProduct] = React.useState(null);

  const getEmoji = (category) => {
    return categoryEmojis[category] || categoryEmojis.default;
  };

  const getStockStyle = (stock) => {
    if (stock <= 0) return styles.outOfStock;
    if (stock <= 10) return styles.lowStock;
    return {};
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      onBarcodeSubmit();
    }
  };

  return (
    <div style={styles.container}>
      <input
        style={styles.searchBox}
        placeholder="🔍 Scan barcode or enter product code..."
        value={barcode}
        onChange={(e) => onBarcodeChange(e.target.value)}
        onKeyPress={handleKeyPress}
        autoFocus
      />

      <div style={styles.grid}>
        {products.map((product) => (
          <div
            key={product.barcode}
            style={{
              ...styles.productCard,
              ...(hoveredProduct === product.barcode ? styles.productCardHover : {}),
              ...(product.stock <= 0 ? { opacity: 0.5, cursor: 'not-allowed' } : {}),
            }}
            onClick={() => product.stock > 0 && onAddToCart(product)}
            onMouseEnter={() => setHoveredProduct(product.barcode)}
            onMouseLeave={() => setHoveredProduct(null)}
          >
            <div style={styles.productEmoji}>{getEmoji(product.category)}</div>
            <div style={styles.productName} title={product.name}>
              {product.name}
            </div>
            <div style={styles.productPrice}>${product.price.toFixed(2)}</div>
            <div style={styles.productBarcode}>#{product.barcode}</div>
            <div style={{ ...styles.productStock, ...getStockStyle(product.stock) }}>
              {product.stock <= 0
                ? 'Out of Stock'
                : product.stock <= 10
                ? `Only ${product.stock} left`
                : `${product.stock} in stock`}
            </div>
            {product.category && (
              <div style={styles.categoryLabel}>{product.category}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductGrid;
