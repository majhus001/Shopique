const onHeaders = require('on-headers');

function logResponseSize(req, res, next) {
  let size = 0;

  // Intercept write
  const originalWrite = res.write;
  const originalEnd = res.end;

  res.write = function (chunk, encoding, callback) {
    if (chunk) size += chunk.length;
    return originalWrite.call(res, chunk, encoding, callback);
  };

  res.end = function (chunk, encoding, callback) {
    if (chunk) size += chunk.length;
    return originalEnd.call(res, chunk, encoding, callback);
  };

  onHeaders(res, () => {
    console.log(`[${req.method}] ${req.originalUrl} → Response size: ${(size / 1024).toFixed(2)} KB`);
  });

  next();
}

module.exports = logResponseSize;
