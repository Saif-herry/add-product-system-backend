const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      index: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
      index: true,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    stock: {
      type: Number,
      default: 0,
      min: 0,
    },
    images: {
      type: [String],
      default: [],
    },
    thumbnail: {
      type: String,
      default: "",
    },

    /**
     * CORE DYNAMIC FIELD:
     * attributes stores all category-specific key-value pairs.
     * e.g. Mobile: { ram: "8GB", processor: "Snapdragon 8 Gen 2", storage: "256GB", color: "Black" }
     * e.g. Bangles: { color: "Gold", size: "2.6", material: "Gold", weight: "15g" }
     *
     * This Mixed type means MongoDB stores it as a flexible sub-document.
     * No frontend changes needed when a new category is added — the UI
     * reads the attribute definitions from the Category model and renders fields accordingly.
     */
    attributes: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    // Structured content sections — driven by category.detailSections
    highlights: {
      type: [String],
      default: [],
    },
    description: {
      type: String,
      default: "",
    },

    isActive: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    tags: {
      type: [String],
      default: [],
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-generate slug from name + timestamp
ProductSchema.pre("validate", function (next) {
  if (this.name && !this.slug) {
    const base = this.name.toLowerCase().replace(/\s+/g, "-");
    this.slug = `${base}-${Date.now()}`;
  }
  next();
});

// Text index for full-text search on name, description, tags
ProductSchema.index(
  { name: "text", description: "text", tags: "text" },
  { weights: { name: 10, tags: 5, description: 1 } }
);

// Compound index for category + price (common filter combo)
ProductSchema.index({ category: 1, price: 1 });
ProductSchema.index({ category: 1, isActive: 1 });

module.exports = mongoose.model("Product", ProductSchema);
