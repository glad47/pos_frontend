import React, { useState, useRef } from 'react';

const styles = {
  container: {
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '15px',
    padding: '20px',
    border: '1px solid rgba(255,255,255,0.1)',
  },
  title: {
    fontSize: '20px',
    fontWeight: 'bold',
    marginBottom: '25px',
  },
  importSection: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
  },
  uploadBox: {
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '15px',
    padding: '30px',
    border: '2px dashed rgba(255,255,255,0.2)',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.3s',
  },
  uploadBoxHover: {
    borderColor: '#e94560',
    background: 'rgba(233, 69, 96, 0.1)',
  },
  uploadIcon: {
    fontSize: '48px',
    marginBottom: '15px',
  },
  uploadTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '10px',
  },
  uploadDesc: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: '14px',
    marginBottom: '15px',
  },
  uploadBtn: {
    display: 'inline-block',
    padding: '10px 25px',
    borderRadius: '8px',
    background: 'linear-gradient(90deg, #e94560, #ff6b6b)',
    color: '#fff',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  hiddenInput: {
    display: 'none',
  },
  templateSection: {
    marginTop: '30px',
    padding: '20px',
    background: 'rgba(255,255,255,0.03)',
    borderRadius: '10px',
  },
  templateTitle: {
    fontSize: '16px',
    fontWeight: 'bold',
    marginBottom: '15px',
    color: 'rgba(255,255,255,0.8)',
  },
  formatTable: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '13px',
  },
  formatTh: {
    textAlign: 'left',
    padding: '10px',
    background: 'rgba(255,255,255,0.1)',
    borderBottom: '1px solid rgba(255,255,255,0.2)',
  },
  formatTd: {
    padding: '10px',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    color: 'rgba(255,255,255,0.8)',
  },
  message: {
    textAlign: 'center',
    padding: '15px',
    marginTop: '20px',
    borderRadius: '8px',
    fontWeight: 'bold',
  },
  success: {
    background: 'rgba(40, 167, 69, 0.2)',
    color: '#28a745',
  },
  error: {
    background: 'rgba(220, 53, 69, 0.2)',
    color: '#dc3545',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '15px',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '3px solid rgba(255,255,255,0.3)',
    borderTop: '3px solid #e94560',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
};

const ImportTab = ({ onImport, loading, message }) => {
  const [hoveredBox, setHoveredBox] = useState(null);
  const productInputRef = useRef(null);
  const loyaltyInputRef = useRef(null);

  const handleFileSelect = (type, event) => {
    const file = event.target.files[0];
    if (file) {
      onImport(type, file);
      event.target.value = '';
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.title}>Import Data from Excel</div>

      <div style={styles.importSection}>
        {/* Products Import */}
        <div
          style={{
            ...styles.uploadBox,
            ...(hoveredBox === 'products' ? styles.uploadBoxHover : {}),
            position: 'relative',
          }}
          onMouseEnter={() => setHoveredBox('products')}
          onMouseLeave={() => setHoveredBox(null)}
          onClick={() => productInputRef.current?.click()}
        >
          {loading && hoveredBox === 'products' && (
            <div style={styles.loadingOverlay}>
              <div style={styles.spinner} />
            </div>
          )}
          <div style={styles.uploadIcon}>📦</div>
          <div style={styles.uploadTitle}>Import Products</div>
          <div style={styles.uploadDesc}>
            Upload Excel file (.xlsx) with product data
          </div>
          <div style={styles.uploadBtn}>Select File</div>
          <input
            ref={productInputRef}
            type="file"
            accept=".xlsx,.xls"
            style={styles.hiddenInput}
            onChange={(e) => handleFileSelect('products', e)}
          />
        </div>

        {/* Loyalty Import */}
        <div
          style={{
            ...styles.uploadBox,
            ...(hoveredBox === 'loyalty' ? styles.uploadBoxHover : {}),
            position: 'relative',
          }}
          onMouseEnter={() => setHoveredBox('loyalty')}
          onMouseLeave={() => setHoveredBox(null)}
          onClick={() => loyaltyInputRef.current?.click()}
        >
          {loading && hoveredBox === 'loyalty' && (
            <div style={styles.loadingOverlay}>
              <div style={styles.spinner} />
            </div>
          )}
          <div style={styles.uploadIcon}>🎁</div>
          <div style={styles.uploadTitle}>Import Loyalty Programs</div>
          <div style={styles.uploadDesc}>
            Upload Excel file (.xlsx) with BOGO/Discount data
          </div>
          <div style={styles.uploadBtn}>Select File</div>
          <input
            ref={loyaltyInputRef}
            type="file"
            accept=".xlsx,.xls"
            style={styles.hiddenInput}
            onChange={(e) => handleFileSelect('loyalty', e)}
          />
        </div>
      </div>

      {message && (
        <div
          style={{
            ...styles.message,
            ...(message.includes('Error') ? styles.error : styles.success),
          }}
        >
          {message}
        </div>
      )}

      {/* Format Templates */}
      <div style={styles.templateSection}>
        <div style={styles.templateTitle}>📋 Products Excel Format</div>
        <table style={styles.formatTable}>
          <thead>
            <tr>
              <th style={styles.formatTh}>Barcode</th>
              <th style={styles.formatTh}>Name</th>
              <th style={styles.formatTh}>Description</th>
              <th style={styles.formatTh}>Price</th>
              <th style={styles.formatTh}>Stock</th>
              <th style={styles.formatTh}>Category</th>
              <th style={styles.formatTh}>TaxRate</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={styles.formatTd}>1001</td>
              <td style={styles.formatTd}>Latte</td>
              <td style={styles.formatTd}>Hot latte</td>
              <td style={styles.formatTd}>4.50</td>
              <td style={styles.formatTd}>100</td>
              <td style={styles.formatTd}>Beverages</td>
              <td style={styles.formatTd}>0.08</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style={styles.templateSection}>
        <div style={styles.templateTitle}>📋 Loyalty Programs Excel Format</div>
        <table style={styles.formatTable}>
          <thead>
            <tr>
              <th style={styles.formatTh}>Name</th>
              <th style={styles.formatTh}>Type</th>
              <th style={styles.formatTh}>BuyQty</th>
              <th style={styles.formatTh}>FreeQty</th>
              <th style={styles.formatTh}>DiscountPercent</th>
              <th style={styles.formatTh}>ProductBarcode</th>
              <th style={styles.formatTh}>Category</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={styles.formatTd}>Buy 2 Get 1</td>
              <td style={styles.formatTd}>BOGO</td>
              <td style={styles.formatTd}>2</td>
              <td style={styles.formatTd}>1</td>
              <td style={styles.formatTd}>0</td>
              <td style={styles.formatTd}>1001</td>
              <td style={styles.formatTd}></td>
            </tr>
          </tbody>
        </table>
      </div>

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default ImportTab;
