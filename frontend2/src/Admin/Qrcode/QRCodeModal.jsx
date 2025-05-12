import React, { useState, useRef, useEffect } from 'react';
import QRCode from 'qrcode';
import './QRCodeModal.css';

// Real QR code component using the qrcode library
const RealQRCode = ({ value, size = 150 }) => {
  const [qrDataUrl, setQrDataUrl] = useState('');
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!value) return;

    const generateQR = async () => {
      try {
        // Generate QR code as data URL
        const dataUrl = await QRCode.toDataURL(value, {
          width: size,
          margin: 1,
          color: {
            dark: '#000000',
            light: '#ffffff'
          }
        });
        setQrDataUrl(dataUrl);
      } catch (err) {
        console.error('Error generating QR code:', err);
      }
    };

    generateQR();
  }, [value, size]);

  return qrDataUrl ? (
    <img
      src={qrDataUrl}
      alt="Product QR Code"
      style={{
        width: size,
        height: size,
        display: 'block',
        margin: '0 auto'
      }}
    />
  ) : (
    <div
      style={{
        width: size,
        height: size,
        backgroundColor: '#f5f5f5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto'
      }}
    >
      Generating QR...
    </div>
  );
};

const QRCodeModal = ({ isOpen, onClose, product }) => {
  const [quantity, setQuantity] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const printContainerRef = useRef(null);

  // Debug product data
  useEffect(() => {
    console.log('QRCodeModal received product:', product);
  }, [product]);

  if (!isOpen) return null;

  if (!product || !product._id) {
    console.error('Invalid product data:', product);
    return (
      <div className="qr-modal-overlay">
        <div className="qr-modal-content">
          <div className="qr-modal-header">
            <h2>Error: Invalid Product Data</h2>
            <button className="qr-close-btn" onClick={onClose}>×</button>
          </div>
          <div className="qr-modal-body">
            <p>Could not generate QR code. Product data is missing or invalid.</p>
            <button className="qr-print-btn" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    );
  }

  // Encode product data as a JSON string
  const productData = {
    id: product._id,
    name: product.name,
    price: product.price,
    brand: product.brand,
    category: product.category,
    subCategory: product.subCategory,
    // Include only essential data to keep QR code simple
  };

  // Create URL with product data
  const qrValue = `${ window.location.origin}/admin/products?data=${encodeURIComponent(JSON.stringify(productData))}`;

  const handlePrint = () => {
    setIsGenerating(true);

    setTimeout(() => {
      const printContent = document.getElementById('qr-print-container');
      const originalContents = document.body.innerHTML;

      document.body.innerHTML = printContent.innerHTML;
      window.print();
      document.body.innerHTML = originalContents;

      // Reload the page after printing to restore React components
      window.location.reload();
    }, 500);
  };

  // Generate an array of QR codes based on quantity
  const qrCodes = Array.from({ length: quantity }, (_, index) => (
    <div key={index} className="qr-code-item">
      <RealQRCode
        value={qrValue}
        size={150}
      />
      <div className="qr-code-info">
        <div className="qr-product-name">{product.name}</div>
        <div className="qr-product-price">₹{product.price}</div>
        <div className="qr-product-id">ID: {product._id}</div>
      </div>
    </div>
  ));

  return (
    <div className="qr-modal-overlay">
      <div className="qr-modal-content">
        <div className="qr-modal-header">
          <h2>Generate QR Codes for {product.name}</h2>
          <button className="qr-close-btn" onClick={onClose}>×</button>
        </div>

        <div className="qr-modal-body">
          <div className="qr-quantity-selector">
            <label htmlFor="qr-quantity">Number of QR Codes to Print:</label>
            <input
              id="qr-quantity"
              type="number"
              min="1"
              max="100"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
            />
          </div>

          <div className="qr-preview">
            <h3>Preview:</h3>
            <div className="qr-code-preview">
              <RealQRCode
                value={qrValue}
                size={200}
              />
            </div>
            <p>Scan this QR code to auto-fill product data</p>
          </div>

          <div className="qr-actions">
            <button
              className="qr-print-btn"
              onClick={handlePrint}
              disabled={isGenerating}
            >
              {isGenerating ? 'Generating...' : 'Print QR Codes'}
            </button>
          </div>
        </div>
      </div>

      {/* Hidden container for printing */}
      <div id="qr-print-container" ref={printContainerRef} style={{ display: 'none' }}>
        <div className="qr-print-header">
          <h1>Product QR Codes</h1>
          <p>Scan to auto-fill product data</p>
        </div>
        <div className="qr-print-grid">
          {qrCodes}
        </div>
      </div>
    </div>
  );
};

export default QRCodeModal;
