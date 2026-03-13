const express = require("express");
const router = express.Router();
const {
  getProducts,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

// GET    /api/products           – list products (with filters & pagination)
router.get("/", getProducts);

// GET    /api/products/:slug     – single product detail page
router.get("/:slug", getProductBySlug);

// POST   /api/products           – admin: create product
router.post("/", createProduct);

// PUT    /api/products/:id       – admin: update product
router.put("/:id", updateProduct);

// DELETE /api/products/:id       – admin: soft-delete product
router.delete("/:id", deleteProduct);

module.exports = router;
