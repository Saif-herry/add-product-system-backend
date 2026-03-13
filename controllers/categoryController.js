const Category = require("../models/Category");
const Product = require("../models/Product");

/**
 * GET /api/categories
 * Returns all active categories (lightweight list for dropdowns)
 */
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true })
      .select("name slug description icon")
      .sort("name");

    res.json({ success: true, data: categories });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/categories/:slug
 * Returns a single category with full attribute definitions
 * Used by frontend to render dynamic Add Product form
 */
const getCategoryBySlug = async (req, res) => {
  try {
    const category = await Category.findOne({
      slug: req.params.slug,
      isActive: true,
    });

    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    res.json({ success: true, data: category });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * POST /api/categories
 * Admin: Create a new category with attribute definitions
 */
const createCategory = async (req, res) => {
  try {
    const { name, slug, description, icon, attributes, detailSections } = req.body;

    // Sort attributes by sortOrder
    const sortedAttrs = (attributes || []).map((attr, i) => ({
      ...attr,
      sortOrder: attr.sortOrder ?? i,
    }));

    const category = await Category.create({
      name,
      slug: slug || name.toLowerCase().replace(/\s+/g, "-"),
      description,
      icon,
      attributes: sortedAttrs,
      detailSections,
    });

    res.status(201).json({ success: true, data: category });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "A category with this name or slug already exists",
      });
    }
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * PUT /api/categories/:id
 * Admin: Update category — including adding/modifying attribute definitions
 * NOTE: Changing attribute keys may affect existing products' attributes map
 */
const updateCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    res.json({ success: true, data: category });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * DELETE /api/categories/:id
 * Admin: Soft-delete a category (sets isActive: false)
 */
const deleteCategory = async (req, res) => {
  try {
    const productCount = await Product.countDocuments({ category: req.params.id });
    if (productCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete: ${productCount} product(s) are linked to this category. Deactivate them first.`,
      });
    }

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    res.json({ success: true, message: "Category deactivated successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
};
