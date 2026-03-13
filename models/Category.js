const mongoose = require("mongoose");

/**
 * AttributeDefinition — defines a single dynamic field for a category.
 * The "type" field drives how the React UI renders the input.
 */
const AttributeDefinitionSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      trim: true,
      // e.g. "ram", "processor", "color"
    },
    label: {
      type: String,
      required: true,
      trim: true,
      // e.g. "RAM", "Processor Speed", "Color"
    },
    type: {
      type: String,
      required: true,
      enum: ["text", "number", "select", "multiselect", "boolean", "range"],
      // Drives UI field rendering on the frontend
    },
    options: {
      // Populated for select / multiselect types
      type: [String],
      default: [],
    },
    unit: {
      // Optional unit label, e.g. "GB", "GHz", "g"
      type: String,
      default: "",
    },
    required: {
      type: Boolean,
      default: false,
    },
    filterable: {
      // Whether this attribute appears as a search filter
      type: Boolean,
      default: true,
    },
    searchable: {
      // Whether this attribute is indexed for text search
      type: Boolean,
      default: false,
    },
    sortOrder: {
      // Controls display order in UI
      type: Number,
      default: 0,
    },
  },
  { _id: false }
);

const CategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    icon: {
      type: String,
      default: "",
    },
    attributes: {
      // The dynamic fields that define all products in this category
      type: [AttributeDefinitionSchema],
      default: [],
    },
    // Sections define how product details page is structured
    detailSections: {
      type: [String],
      default: ["highlights", "specifications", "description"],
      // e.g. Mobile: ["highlights", "specifications", "description"]
      // Bangles: ["specifications", "description"]
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-generate slug from name before saving
CategorySchema.pre("validate", function (next) {
  if (this.name && !this.slug) {
    this.slug = this.name.toLowerCase().replace(/\s+/g, "-");
  }
  next();
});

module.exports = mongoose.model("Category", CategorySchema);
