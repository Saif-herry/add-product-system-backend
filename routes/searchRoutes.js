const express = require("express");
const router = express.Router();
const { getFilters, searchProducts } = require("../controllers/searchController");

// GET /api/search?q=&category=&page=&...attrFilters
router.get("/", searchProducts);

// GET /api/search/filters?category=<slug>
// Returns dynamically computed filter options for a category
router.get("/filters", getFilters);

module.exports = router;
