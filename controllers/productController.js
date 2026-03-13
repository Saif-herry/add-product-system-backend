const Product = require("../models/Product");
const Category = require("../models/Category");

/**
 * GET /api/products
 * List products with optional category filter and pagination
 */
const getProducts = async (req, res) => {
  try {
    const { category, page = 1, limit = 20, featured } = req.query;
    const filter = { isActive: true };

    if (category) {
      // Accept either a category ID or slug
      if (category.match(/^[0-9a-fA-F]{24}$/)) {
        filter.category = category;
      } else {
        const cat = await Category.findOne({ slug: category });
        if (cat) filter.category = cat._id;
      }
    }

    if (featured === "true") filter.isFeatured = true;

    const skip = (Number(page) - 1) * Number(limit);
    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate("category", "name slug")
        .select("-__v")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Product.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: products,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/products/:slug
 * Get a single product by slug with full details
 * Also returns the category's attribute definitions for detail page rendering
 */
const getProductBySlug = async (req, res) => {
  try {
    const product = await Product.findOne({
      slug: req.params.slug,
      isActive: true,
    }).populate("category");

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // Attach category's attribute definitions so the detail page
    // knows how to label and render each attribute value
    const response = {
      ...product.toObject(),
      categoryDefinition: product.category, // full category with attributes[]
    };

    res.json({ success: true, data: response });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * POST /api/products
 * Admin: Create a new product
 * Validates attributes against category's attribute definitions
 */
const createProduct = async (req, res) => {
  try {
    const {
      name,
      category: categoryId,
      price,
      stock,
      images,
      thumbnail,
      attributes,
      highlights,
      description,
      tags,
      isFeatured,
    } = req.body;

    // Validate category exists
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(400).json({ success: false, message: "Invalid category" });
    }

    // Validate required attributes against category definition
    const missingRequired = [];
    for (const attrDef of category.attributes) {
      if (attrDef.required && !attributes?.[attrDef.key]) {
        missingRequired.push(attrDef.label);
      }
    }

    if (missingRequired.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required attributes: ${missingRequired.join(", ")}`,
      });
    }

    const product = await Product.create({
      name,
      category: categoryId,
      price,
      stock,
      images,
      thumbnail,
      attributes: attributes || {},
      highlights: highlights || [],
      description,
      tags: tags || [],
      isFeatured: isFeatured || false,
    });

    const populated = await product.populate("category", "name slug");

    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * PUT /api/products/:id
 * Admin: Update a product
 */
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).populate("category", "name slug");

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * DELETE /api/products/:id
 * Admin: Soft-delete a product
 */
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.json({ success: true, message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getProducts,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
};
