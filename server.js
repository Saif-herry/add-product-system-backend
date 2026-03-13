require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const connectDB = require("./config/db");
const categoryRoutes = require("./routes/categoryRoutes");
const productRoutes = require("./routes/productRoutes");
const searchRoutes = require("./routes/searchRoutes");
const { errorHandler, notFound } = require("./middleware/errorHandler");

// ── Connect to MongoDB ────────────────────────────────────────────────────────
connectDB();

const app = express();

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({ origin: "*" })); // Allow all origins (restrict in production)
app.use(express.json({ limit: "10mb" })); // Parse JSON bodies
app.use(morgan("dev")); // HTTP request logging

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Dynamic Product API is running",
    timestamp: new Date().toISOString(),
  });
});

// ── API Routes ────────────────────────────────────────────────────────────────
// IMPORTANT: /api/search/filters must be registered BEFORE /api/search
// to avoid Express matching "filters" as a product slug
app.use("/api/search", searchRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);

// ── Error Handlers ────────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ── Start Server ──────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📋 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`\nAvailable endpoints:`);
  console.log(`  GET    /api/health`);
  console.log(`  GET    /api/categories`);
  console.log(`  GET    /api/categories/:slug`);
  console.log(`  POST   /api/categories`);
  console.log(`  PUT    /api/categories/:id`);
  console.log(`  DELETE /api/categories/:id`);
  console.log(`  GET    /api/products`);
  console.log(`  GET    /api/products/:slug`);
  console.log(`  POST   /api/products`);
  console.log(`  PUT    /api/products/:id`);
  console.log(`  DELETE /api/products/:id`);
  console.log(`  GET    /api/search?q=&category=&...filters`);
  console.log(`  GET    /api/search/filters?category=<slug>`);
});

module.exports = app;
