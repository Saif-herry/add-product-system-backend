/**
 * Seed script — run with: npm run seed
 * Populates DB with sample categories (Mobile, Bangles, Laptop) and products.
 */

require("dotenv").config();
const mongoose = require("mongoose");
const Category = require("../models/Category");
const Product = require("../models/Product");

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/dynamic_products";

const categories = [
  {
    name: "Mobile",
    slug: "mobile",
    description: "Smartphones and mobile devices",
    icon: "📱",
    detailSections: ["highlights", "specifications", "description"],
    attributes: [
      {
        key: "ram",
        label: "RAM",
        type: "select",
        options: ["4GB", "6GB", "8GB", "12GB", "16GB"],
        unit: "GB",
        required: true,
        filterable: true,
        sortOrder: 0,
      },
      {
        key: "processor",
        label: "Processor",
        type: "text",
        required: true,
        filterable: true,
        searchable: true,
        sortOrder: 1,
      },
      {
        key: "storage",
        label: "Storage",
        type: "select",
        options: ["64GB", "128GB", "256GB", "512GB", "1TB"],
        required: true,
        filterable: true,
        sortOrder: 2,
      },
      {
        key: "color",
        label: "Color",
        type: "select",
        options: [
          "Black",
          "White",
          "Blue",
          "Green",
          "Purple",
          "Gold",
          "Silver",
        ],
        required: true,
        filterable: true,
        sortOrder: 3,
      },
      {
        key: "battery",
        label: "Battery",
        type: "number",
        unit: "mAh",
        filterable: true,
        sortOrder: 4,
      },
      {
        key: "display",
        label: "Display Size",
        type: "number",
        unit: "inches",
        filterable: true,
        sortOrder: 5,
      },
    ],
  },
  {
    name: "Bangles",
    slug: "bangles",
    description: "Traditional and modern bangles and bracelets",
    icon: "💎",
    detailSections: ["specifications", "description"],
    attributes: [
      {
        key: "color",
        label: "Color",
        type: "select",
        options: [
          "Gold",
          "Silver",
          "Rose Gold",
          "Copper",
          "Multicolor",
          "Red",
          "Green",
          "Blue",
        ],
        required: true,
        filterable: true,
        sortOrder: 0,
      },
      {
        key: "size",
        label: "Size",
        type: "select",
        options: ["2.2", "2.4", "2.6", "2.8", "3.0"],
        required: true,
        filterable: true,
        sortOrder: 1,
      },
      {
        key: "material",
        label: "Material",
        type: "select",
        options: [
          "Gold",
          "Silver",
          "Copper",
          "Brass",
          "Glass",
          "Plastic",
          "Lac",
        ],
        required: true,
        filterable: true,
        sortOrder: 2,
      },
      {
        key: "weight",
        label: "Weight",
        type: "number",
        unit: "g",
        filterable: true,
        sortOrder: 3,
      },
      {
        key: "occasion",
        label: "Occasion",
        type: "multiselect",
        options: ["Wedding", "Festival", "Party", "Casual", "Traditional"],
        filterable: true,
        sortOrder: 4,
      },
    ],
  },
  {
    name: "Laptop",
    slug: "laptop",
    description: "Laptops and notebooks",
    icon: "💻",
    detailSections: ["highlights", "specifications", "description"],
    attributes: [
      {
        key: "processor",
        label: "Processor",
        type: "text",
        required: true,
        filterable: true,
        searchable: true,
        sortOrder: 0,
      },
      {
        key: "ram",
        label: "RAM",
        type: "select",
        options: ["8GB", "16GB", "32GB", "64GB"],
        required: true,
        filterable: true,
        sortOrder: 1,
      },
      {
        key: "storage",
        label: "Storage",
        type: "select",
        options: ["256GB SSD", "512GB SSD", "1TB SSD", "2TB SSD"],
        required: true,
        filterable: true,
        sortOrder: 2,
      },
      {
        key: "display",
        label: "Display Size",
        type: "number",
        unit: "inches",
        filterable: true,
        sortOrder: 3,
      },
      {
        key: "os",
        label: "Operating System",
        type: "select",
        options: ["Windows 11", "macOS", "Ubuntu", "ChromeOS"],
        required: true,
        filterable: true,
        sortOrder: 4,
      },
    ],
  },
];

const products = [
  {
    name: "Samsung Galaxy S24 Ultra",
    price: 124999,
    stock: 50,
    categorySlug: "mobile",
    thumbnail: "https://via.placeholder.com/400x400?text=S24+Ultra",
    attributes: {
      ram: "12GB",
      processor: "Snapdragon 8 Gen 3",
      storage: "256GB",
      color: "Black",
      battery: 5001,
      display: 6.8,
    },
    highlights: [
      "200MP Camera",
      "S Pen included",
      "7 years of OS updates",
      "Titanium frame",
    ],
    description:
      "The Galaxy S24 Ultra redefines mobile excellence with the most powerful processor, a stunning 200MP camera, and the iconic S Pen built right in.",
    tags: ["samsung", "galaxy", "flagship", "android"],
  },
  {
    name: "iPhone 15 Pro Max",
    price: 159900,
    stock: 30,
    categorySlug: "mobile",
    thumbnail: "https://via.placeholder.com/400x400?text=iPhone+15+Pro",
    attributes: {
      ram: "8GB",
      processor: "Apple A17 Pro",
      storage: "256GB",
      color: "Gold",
      battery: 4422,
      display: 6.7,
    },
    highlights: [
      "A17 Pro chip",
      "Titanium design",
      "Action Button",
      "USB-C with USB 3",
    ],
    description:
      "iPhone 15 Pro Max. Forged in titanium and featuring the groundbreaking A17 Pro chip, a customizable Action button, and the most powerful iPhone camera system ever.",
    tags: ["apple", "iphone", "flagship", "ios"],
  },
  {
    name: "OnePlus 12",
    price: 64999,
    stock: 100,
    categorySlug: "mobile",
    thumbnail: "https://via.placeholder.com/400x400?text=OnePlus+12",
    attributes: {
      ram: "12GB",
      processor: "Snapdragon 8 Gen 3",
      storage: "256GB",
      color: "Black",
      battery: 5400,
      display: 6.82,
    },
    highlights: [
      "Hasselblad camera tuning",
      "100W SUPERVOOC charging",
      "Fluid AMOLED display",
    ],
    description:
      "The OnePlus 12 delivers flagship performance at a compelling price point.",
    tags: ["oneplus", "android", "flagship"],
  },
  {
    name: "Traditional Gold Bangles Set",
    price: 3999,
    stock: 200,
    categorySlug: "bangles",
    thumbnail: "https://via.placeholder.com/400x400?text=Gold+Bangles",
    attributes: {
      color: "Gold",
      size: "2.6",
      material: "Brass",
      weight: 45,
      occasion: ["Wedding", "Festival", "Traditional"],
    },
    highlights: [],
    description:
      "A stunning set of traditional gold-toned bangles, perfect for weddings and festivals. Crafted from high-quality brass with an 18K gold plating finish.",
    tags: ["bangles", "gold", "traditional", "wedding"],
  },
  {
    name: "Silver Glass Bangles Pack of 12",
    price: 599,
    stock: 500,
    categorySlug: "bangles",
    thumbnail: "https://via.placeholder.com/400x400?text=Glass+Bangles",
    attributes: {
      color: "Silver",
      size: "2.4",
      material: "Glass",
      weight: 20,
      occasion: ["Casual", "Festival"],
    },
    description:
      "Elegant silver glass bangles for everyday wear and festive occasions.",
    tags: ["bangles", "glass", "silver", "casual"],
  },
];

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB");

  // Clear existing data
  await Category.deleteMany({});
  await Product.deleteMany({});
  console.log("Cleared existing data");

  // Insert categories
  const insertedCategories = await Category.insertMany(categories);
  console.log(`✅ Inserted ${insertedCategories.length} categories`);

  // Build slug → _id map
  const slugToId = {};
  for (const cat of insertedCategories) {
    slugToId[cat.slug] = cat._id;
  }

  // Insert products
  const productDocs = products.map((p) => ({
    ...p,
    category: slugToId[p.categorySlug],
    categorySlug: undefined,
  }));

  const insertedProducts = await Product.insertMany(productDocs);
  console.log(`✅ Inserted ${insertedProducts.length} products`);

  console.log("\n🌱 Seed complete!");
  console.log("Categories:", categories.map((c) => c.name).join(", "));
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
