import React, { useState } from 'react';

const styles = {
  container: {
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '15px',
    padding: '20px',
    border: '1px solid rgba(255,255,255,0.1)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  title: {
    fontSize: '20px',
    fontWeight: 'bold',
  },
  searchInput: {
    padding: '10px 15px',
    borderRadius: '8px',
    border: '1px solid rgba(255,255,255,0.2)',
    background: 'rgba(255,255,255,0.1)',
    color: '#fff',
    fontSize: '14px',
    outline: 'none',
    width: '250px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    textAlign: 'left',
    padding: '12px 15px',
    background: 'rgba(255,255,255,0.1)',
    borderBottom: '2px solid rgba(255,255,255,0.2)',
    fontSize: '13px',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.8)',
  },
  td: {
    padding: '12px 15px',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    fontSize: '14px',
  },
  tr: {
    transition: 'background 0.2s',
  },
  trHover: {
    background: 'rgba(255,255,255,0.05)',
  },
  barcode: {
    fontFamily: 'monospace',
    background: 'rgba(255,255,255,0.1)',
    padding: '3px 8px',
    borderRadius: '4px',
    fontSize: '12px',
  },
  price: {
    color: '#e94560',
    fontWeight: 'bold',
  },
  stock: {
    fontWeight: 'bold',
  },
  stockLow: {
    color: '#ffc107',
  },
  stockOut: {
    color: '#dc3545',
  },
  stockOk: {
    color: '#28a745',
  },
  category: {
    display: 'inline-block',
    background: 'rgba(233, 69, 96, 0.2)',
    color: '#e94560',
    padding: '3px 10px',
    borderRadius: '15px',
    fontSize: '12px',
  },
  taxRate: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: '12px',
  },
  emptyState: {
    textAlign: 'center',
    padding: '40px',
    color: 'rgba(255,255,255,0.5)',
  },
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '10px',
    marginTop: '20px',
  },
  pageBtn: {
    padding: '8px 15px',
    borderRadius: '8px',
    border: '1px solid rgba(255,255,255,0.2)',
    background: 'transparent',
    color: '#fff',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  pageBtnActive: {
    background: '#e94560',
    borderColor: '#e94560',
  },
  pageInfo: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: '14px',
  },
};

const ProductsTable = ({ products }) => {
  const [search, setSearch] = useState('');
  const [hoveredRow, setHoveredRow] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(search.toLowerCase()) ||
      product.barcode.includes(search) ||
      (product.category && product.category.toLowerCase().includes(search.toLowerCase()))
  );

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  const getStockStyle = (stock) => {
    if (stock <= 0) return styles.stockOut;
    if (stock <= 10) return styles.stockLow;
    return styles.stockOk;
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.title}>Products ({filteredProducts.length})</div>
        <input
          style={styles.searchInput}
          placeholder="🔍 Search products..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
        />
      </div>

      {paginatedProducts.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={{ fontSize: '48px', marginBottom: '15px' }}>📦</div>
          <p>No products found</p>
        </div>
      ) : (
        <>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Barcode</th>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Category</th>
                <th style={styles.th}>Price</th>
                <th style={styles.th}>Stock</th>
                <th style={styles.th}>Tax</th>
              </tr>
            </thead>
            <tbody>
              {paginatedProducts.map((product) => (
                <tr
                  key={product.barcode}
                  style={{
                    ...styles.tr,
                    ...(hoveredRow === product.barcode ? styles.trHover : {}),
                  }}
                  onMouseEnter={() => setHoveredRow(product.barcode)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                  <td style={styles.td}>
                    <span style={styles.barcode}>{product.barcode}</span>
                  </td>
                  <td style={styles.td}>{product.name}</td>
                  <td style={styles.td}>
                    {product.category && (
                      <span style={styles.category}>{product.category}</span>
                    )}
                  </td>
                  <td style={{ ...styles.td, ...styles.price }}>
                    ${product.price.toFixed(2)}
                  </td>
                  <td style={{ ...styles.td, ...styles.stock, ...getStockStyle(product.stock) }}>
                    {product.stock}
                  </td>
                  <td style={{ ...styles.td, ...styles.taxRate }}>
                    {((product.taxRate || 0) * 100).toFixed(0)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div style={styles.pagination}>
              <button
                style={{
                  ...styles.pageBtn,
                  opacity: currentPage === 1 ? 0.5 : 1,
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                }}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              <span style={styles.pageInfo}>
                Page {currentPage} of {totalPages}
              </span>
              <button
                style={{
                  ...styles.pageBtn,
                  opacity: currentPage === totalPages ? 0.5 : 1,
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                }}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProductsTable;
