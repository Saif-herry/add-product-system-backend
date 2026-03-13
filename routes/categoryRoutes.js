const express = require("express");
const router = express.Router();
const {
  getCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController");

// GET  /api/categories          – list all active categories
router.get("/", getCategories);

// GET  /api/categories/:slug    – single category with attribute definitions
router.get("/:slug", getCategoryBySlug);

// POST /api/categories          – admin: create category
router.post("/", createCategory);

// PUT  /api/categories/:id      – admin: update category
router.put("/:id", updateCategory);

// DELETE /api/categories/:id   – admin: soft-delete category
router.delete("/:id", deleteCategory);

module.exports = router;
