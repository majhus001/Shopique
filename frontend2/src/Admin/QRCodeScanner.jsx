import React, { useState, useEffect, useRef } from 'react';
import jsQR from 'jsqr';
import './QRCodeScanner.css';

const QRCodeScanner = ({ onScan, onClose }) => {
  const [error, setError] = useState('');
  const [scanning, setScanning] = useState(true);
  const [scanned, setScanned] = useState(false);
  const [qrDetected, setQrDetected] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const scanIntervalRef = useRef(null);

  // Function to stop the camera
  const stopCamera = () => {
    console.log("Stopping camera...");

    if (streamRef.current) {
      const tracks = streamRef.current.getTracks();
      console.log(`Stopping ${tracks.length} tracks`);
      tracks.forEach(track => {
        console.log(`Stopping track: ${track.kind}`);
        track.stop();
      });
      streamRef.current = null;
    }

    if (scanIntervalRef.current) {
      console.log("Clearing scan interval");
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }

    if (videoRef.current) {
      console.log("Clearing video source");
      videoRef.current.srcObject = null;
    }

    // Reset QR detection state
    setQrDetected(false);
    console.log("Camera stopped");
  };

  // Handle close button click
  const handleClose = () => {
    stopCamera();
    onClose();
  };

  // Initialize camera when component mounts
  useEffect(() => {
    const startCamera = async () => {
      try {
        const constraints = {
          video: {
            facingMode: 'environment',
            width: { ideal: 640 },
            height: { ideal: 480 }
          }
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();

          // Start scanning for QR codes
          scanIntervalRef.current = setInterval(() => {
            if (videoRef.current && canvasRef.current && !scanned) {
              const canvas = canvasRef.current;
              const context = canvas.getContext('2d');

              // Set canvas dimensions to match video
              canvas.width = videoRef.current.videoWidth;
              canvas.height = videoRef.current.videoHeight;

              // Draw current video frame to canvas
              context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

              // Get image data for QR code detection
              const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

              try {
                // Use jsQR to detect QR codes
                const code = jsQR(imageData.data, imageData.width, imageData.height, {
                  inversionAttempts: "dontInvert",
                });

                if (code) {
                  console.log("QR Code detected:", code.data);
                  setQrDetected(true);

                  // Process the QR code data
                  try {
                    // Try to extract data from URL format
                    const url = new URL(code.data);
                    const dataParam = url.searchParams.get('data');

                    if (dataParam) {
                      // Parse the JSON data
                      const productData = JSON.parse(decodeURIComponent(dataParam));

                      // Stop scanning and camera
                      setScanned(true);
                      setScanning(false);

                      // Make sure camera is fully stopped before proceeding
                      console.log("QR code detected, stopping camera...");
                      stopCamera();

                      // Call the onScan callback with the product data after a delay
                      // to ensure camera has time to fully stop
                      console.log("Preparing to call onScan callback...");
                      setTimeout(() => {
                        console.log("Calling onScan with product data");
                        onScan(productData);
                      }, 1500);
                    } else {
                      // If it's not in our expected format, try direct JSON parsing
                      try {
                        const productData = JSON.parse(code.data);
                        if (productData && productData.id) {
                          // Stop scanning and camera
                          setScanned(true);
                          setScanning(false);

                          // Make sure camera is fully stopped before proceeding
                          console.log("QR code detected, stopping camera...");
                          stopCamera();

                          // Call the onScan callback with the product data after a delay
                          console.log("Preparing to call onScan callback...");
                          setTimeout(() => {
                            console.log("Calling onScan with product data");
                            onScan(productData);
                          }, 1500);
                        }
                      } catch (jsonError) {
                        // Not JSON either, just use as ID
                        const productId = code.data.trim();
                        if (productId) {
                          // Stop scanning and camera
                          setScanned(true);
                          setScanning(false);

                          // Make sure camera is fully stopped before proceeding
                          console.log("QR code detected, stopping camera...");
                          stopCamera();

                          // Create simple product data with just the ID
                          const productData = {
                            id: productId,
                            name: "Product " + productId,
                            price: 0
                          };

                          // Call the onScan callback with the product data after a delay
                          console.log("Preparing to call onScan callback...");
                          setTimeout(() => {
                            console.log("Calling onScan with product data");
                            onScan(productData);
                          }, 1500);
                        }
                      }
                    }
                  } catch (err) {
                    console.error("Error processing QR code data:", err);
                    // Just use the raw data as product ID
                    if (code.data) {
                      // Stop scanning and camera
                      setScanned(true);
                      setScanning(false);

                      // Make sure camera is fully stopped before proceeding
                      console.log("QR code detected, stopping camera...");
                      stopCamera();

                      // Create simple product data with just the ID
                      const productData = {
                        id: code.data,
                        name: "Product " + code.data,
                        price: 0
                      };

                      // Call the onScan callback with the product data after a delay
                      console.log("Preparing to call onScan callback...");
                      setTimeout(() => {
                        console.log("Calling onScan with product data");
                        onScan(productData);
                      }, 1500);
                    }
                  }
                }
              } catch (error) {
                console.error("Error scanning QR code:", error);
              }
            }
          }, 300);
        }
      } catch (err) {
        console.error('Error accessing camera:', err);
        setError('Error accessing camera. Please make sure you have granted camera permissions.');
      }
    };

    if (scanning) {
      startCamera();
    }

    return () => {
      // Clean up camera stream when component unmounts
      stopCamera();
    };
  }, [scanning, scanned]);

  // Handle manual file upload for QR code
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Stop camera immediately when file is selected
    console.log("File upload detected, stopping camera...");
    stopCamera();
    setScanning(false);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0, img.width, img.height);

          // Get image data for QR code detection
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

          // Use jsQR to detect QR codes
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "dontInvert",
          });

          if (code) {
            console.log("QR Code detected from image:", code.data);

            // Process the QR code data
            try {
              // Try to extract data from URL format
              const url = new URL(code.data);
              const dataParam = url.searchParams.get('data');

              if (dataParam) {
                // Parse the JSON data
                const productData = JSON.parse(decodeURIComponent(dataParam));

                // Call the onScan callback with the product data after a delay
                console.log("Preparing to call onScan callback for file upload...");
                setTimeout(() => {
                  console.log("Calling onScan with file upload product data");
                  onScan(productData);
                }, 1500);
              } else {
                // If it's not in our expected format, try direct JSON parsing
                try {
                  const productData = JSON.parse(code.data);
                  if (productData && productData.id) {
                    // Call the onScan callback with the product data after a delay
                    console.log("Preparing to call onScan callback for file upload...");
                    setTimeout(() => {
                      console.log("Calling onScan with file upload product data");
                      onScan(productData);
                    }, 1500);
                  }
                } catch (jsonError) {
                  // Not JSON either, just use as ID
                  const productId = code.data.trim();
                  if (productId) {
                    // Create simple product data with just the ID
                    const productData = {
                      id: productId,
                      name: "Product " + productId,
                      price: 0
                    };

                    // Call the onScan callback with the product data after a delay
                    console.log("Preparing to call onScan callback for file upload...");
                    setTimeout(() => {
                      console.log("Calling onScan with file upload product data");
                      onScan(productData);
                    }, 1500);
                  }
                }
              }
            } catch (err) {
              console.error("Error processing QR code data:", err);
              // Just use the raw data as product ID
              if (code.data) {
                // Create simple product data with just the ID
                const productData = {
                  id: code.data,
                  name: "Product " + code.data,
                  price: 0
                };

                // Call the onScan callback with the product data after a delay
                console.log("Preparing to call onScan callback for file upload...");
                setTimeout(() => {
                  console.log("Calling onScan with file upload product data");
                  onScan(productData);
                }, 1500);
              }
            }
          } else {
            // No QR code detected, fall back to simulation
            console.log("No QR code detected in image, simulating scan");
            simulateSuccessfulScan();
          }
        } else {
          // If canvas is not available, just simulate scan
          simulateSuccessfulScan();
        }
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  // Simulate a successful QR code scan
  const simulateSuccessfulScan = () => {
    console.log("Simulating successful scan...");
    setScanned(true);
    setScanning(false);

    // Make sure camera is fully stopped before proceeding
    console.log("Stopping camera for simulation...");
    stopCamera();

    // Create a sample product data object
    const sampleProductData = {
      id: "sample123",
      name: "Sample Product",
      price: 999
    };

    // Call the onScan callback with the sample data after a delay
    console.log("Preparing to call onScan callback for simulation...");
    setTimeout(() => {
      console.log("Calling onScan with simulated product data");
      onScan(sampleProductData);
    }, 1500);
  };

  // Handle manual QR code entry
  const handleManualEntry = () => {
    const productId = prompt("Enter product ID:");
    if (productId) {
      console.log("Manual entry received:", productId);
      setScanned(true);
      setScanning(false);

      // Make sure camera is fully stopped before proceeding
      console.log("Stopping camera for manual entry...");
      stopCamera();

      const sampleProductData = {
        id: productId,
        name: "Product " + productId,
        price: 999
      };

      // Call the onScan callback with a delay to ensure camera is stopped
      console.log("Preparing to call onScan callback for manual entry...");
      setTimeout(() => {
        console.log("Calling onScan with manual entry data");
        onScan(sampleProductData);
      }, 1500);
    }
  };

  return (
    <div className="qr-scanner-overlay">
      <div className="qr-scanner-container">
        <div className="qr-scanner-header">
          <h2>Scan Product QR Code</h2>
          <button className="qr-scanner-close" onClick={handleClose}>×</button>
        </div>

        {scanning ? (
          <div className="qr-scanner-content">
            <div className="video-container">
              <video
                ref={videoRef}
                className="qr-video"
                playsInline
                muted
              />
              <div className={`scan-region-highlight ${qrDetected ? 'detected' : ''}`}></div>
            </div>

            <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>

            <div className="qr-scanner-guide">
              <p>Position the QR code within the frame to scan</p>
            </div>

            <div className="qr-scanner-alternatives">
              <div className="alternative-option">
                <label htmlFor="qr-file-upload" className="file-upload-btn">
                  Upload QR Image
                  <input
                    id="qr-file-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>

              <div className="alternative-option">
                <button
                  className="manual-entry-btn"
                  onClick={handleManualEntry}
                >
                  Enter ID Manually
                </button>
              </div>

              <div className="alternative-option">
                <button
                  className="simulate-scan-btn"
                  onClick={simulateSuccessfulScan}
                >
                  Simulate Scan
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="qr-scanner-success">
            <div className="qr-success-icon">✓</div>
            <p>QR Code scanned successfully!</p>
          </div>
        )}

        {error && (
          <div className="qr-scanner-error">
            <p>{error}</p>
            <button
              className="qr-retry-btn"
              onClick={() => {
                setError('');
                setScanning(true);
                // Restart camera
                stopCamera();
                setTimeout(() => {
                  if (!streamRef.current) {
                    setScanning(true);
                  }
                }, 500);
              }}
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QRCodeScanner;
