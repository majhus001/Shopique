const { query } = require('express-validator');

const validateQueryParams = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('minPrice').optional().isFloat({ min: 0 }).toFloat(),
  query('maxPrice').optional().isFloat({ min: 0 }).toFloat(),
  query('minRating').optional().isFloat({ min: 0, max: 5 }).toFloat(),
  query('inStock').optional().isBoolean().toBoolean(),
  query('sort').optional().isIn(['price_asc', 'price_desc', 'rating', 'newest', 'popular']),
  (req, res, next) => {
    // Check if maxPrice is greater than minPrice if both exist
    if (req.query.minPrice && req.query.maxPrice && 
        Number(req.query.maxPrice) < Number(req.query.minPrice)) {
      return res.status(400).json({
        success: false,
        error: 'maxPrice must be greater than minPrice'
      });
    }
    next();
  }
];

module.exports = { validateQueryParams };