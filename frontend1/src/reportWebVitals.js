import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

const reportWebVitals = (onPerfEntry) => {
  console.log("✅ reportWebVitals initialized");

  if (onPerfEntry && typeof onPerfEntry === 'function') {
    getCLS(onPerfEntry);
    getFID(onPerfEntry);
    getFCP(onPerfEntry);
    getLCP(onPerfEntry);
    getTTFB(onPerfEntry);
  }
};

export default reportWebVitals;
