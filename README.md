# Dynamic Product Backend API

A scalable, backend-driven REST API built with **Node.js + Express + MongoDB** that powers a dynamic product management and search system where product attributes and search filters are entirely category-driven.

---

## Architecture Overview

```
backend/
├── config/
│   └── db.js                  # MongoDB connection
├── controllers/
│   ├── categoryController.js  # Category CRUD + attribute management
│   ├── productController.js   # Product CRUD with dynamic attributes
│   └── searchController.js    # Backend-driven search + dynamic filter generation
├── middleware/
│   └── errorHandler.js        # Global error handling + 404 handler
├── models/
│   ├── Category.js            # Category schema with AttributeDefinition sub-schema
│   └── Product.js             # Product schema with Mixed attributes map
├── routes/
│   ├── categoryRoutes.js
│   ├── productRoutes.js
│   └── searchRoutes.js
├── utils/
│   └── seed.js                # Database seeder (Mobile, Bangles, Laptop categories)
├── server.js                  # Express app entry point
├── .env.example
└── package.json
```

---

## Key Design Decisions

### 1. Dynamic Attributes via `Mixed` type

Products store a flexible `attributes` map (`mongoose.Schema.Types.Mixed`):

```json
// Mobile product
{ "ram": "8GB", "processor": "Snapdragon 8 Gen 3", "color": "Black" }

// Bangle product
{ "color": "Gold", "size": "2.6", "material": "Brass", "weight": 45 }
```

No schema change is needed when a new category is added.

### 2. Category-Driven UI (no frontend hardcoding)

Each `Category` document stores `attributes[]` — an array of `AttributeDefinition` objects:

```json
{
  "key": "ram",
  "label": "RAM",
  "type": "select", // → renders as <select> in React
  "options": ["4GB", "8GB"], // → dropdown options
  "required": true,
  "filterable": true,
  "unit": "GB"
}
```

The React Add Product form reads this array and **renders fields dynamically** — no frontend changes needed for new categories.

### 3. Backend-Driven Search Filters (`GET /api/search/filters`)

Filters are **computed from live product data**, not hardcoded:

- `select`/`text` attributes → `Product.distinct(attrKey)` gives real options
- `number` attributes → `$min/$max` aggregation gives real ranges
- Price range always included

### 4. Scalable Search (`GET /api/search`)

- MongoDB **text index** on `name`, `description`, `tags` with weights
- Dynamic attribute filters via query params (`?color=Black&ram=8GB`)
- Multi-value support: `?color=Black&color=Gold` → `$in` query
- Single `$facet` aggregation for data + total count in one DB round-trip

---

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB 6+ (local or Atlas)

### Installation

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI
```

### Run

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start

# Seed database with sample data
npm run seed
```

---

## API Reference

### Categories

| Method | Endpoint                | Description                             |
| ------ | ----------------------- | --------------------------------------- |
| GET    | `/api/categories`       | List all active categories              |
| GET    | `/api/categories/:slug` | Get category with attribute definitions |
| POST   | `/api/categories`       | Create category (admin)                 |
| PUT    | `/api/categories/:id`   | Update category (admin)                 |
| DELETE | `/api/categories/:id`   | Soft-delete category (admin)            |

**Create Category Example:**

```json
POST /api/categories
{
  "name": "Watches",
  "description": "Smartwatches and traditional watches",
  "attributes": [
    { "key": "type", "label": "Type", "type": "select", "options": ["Smartwatch", "Analog", "Digital"], "required": true, "filterable": true },
    { "key": "brandMaterial", "label": "Band Material", "type": "select", "options": ["Leather", "Silicone", "Metal"], "filterable": true },
    { "key": "waterResistance", "label": "Water Resistance", "type": "number", "unit": "ATM", "filterable": true }
  ],
  "detailSections": ["highlights", "specifications", "description"]
}
```

✅ **No frontend changes needed** — the React form will automatically render these fields.

### Products

| Method | Endpoint              | Description                                              |
| ------ | --------------------- | -------------------------------------------------------- |
| GET    | `/api/products`       | List products (with category filter, pagination)         |
| GET    | `/api/products/:slug` | Product detail (includes category attribute definitions) |
| POST   | `/api/products`       | Create product (admin)                                   |
| PUT    | `/api/products/:id`   | Update product (admin)                                   |
| DELETE | `/api/products/:id`   | Soft-delete product (admin)                              |

**Create Product Example:**

```json
POST /api/products
{
  "name": "Samsung Galaxy S24 Ultra",
  "category": "<category_id>",
  "price": 124999,
  "stock": 50,
  "attributes": {
    "ram": "12GB",
    "processor": "Snapdragon 8 Gen 3",
    "storage": "256GB",
    "color": "Black",
    "battery": 5001
  },
  "highlights": ["200MP Camera", "S Pen included"],
  "description": "The most powerful Galaxy ever.",
  "tags": ["samsung", "flagship", "android"]
}
```

### Search & Filters

| Method | Endpoint                                                        | Description                        |
| ------ | --------------------------------------------------------------- | ---------------------------------- |
| GET    | `/api/search/filters?category=mobile`                           | Get dynamic filters for a category |
| GET    | `/api/search?q=samsung&category=mobile&ram=12GB&minPrice=50010` | Search with filters                |

**Search Query Params:**

- `q` — text search query
- `category` — category slug
- `minPrice` / `maxPrice` — price range
- `sort` — `relevance`, `newest`, `price-asc`, `price-desc`, `featured`
- `page` / `limit` — pagination
- `<attrKey>=<value>` — any attribute filter (e.g. `ram=8GB&color=Black`)

---

## Adding a New Category (No Frontend Changes)

1. `POST /api/categories` with the category name and attribute definitions
2. That's it ✅

The React frontend reads attribute definitions from the API and renders the form dynamically. The search filter endpoint computes available options from live product data.

---

## Bonus: Why This Design Scales

| Concern            | Solution                                                               |
| ------------------ | ---------------------------------------------------------------------- |
| New category       | Just POST to `/api/categories` — zero frontend deploys                 |
| New attribute type | Add enum value to `AttributeDefinition.type`, handle in React renderer |
| Search performance | MongoDB text index + compound indexes on `{category, price}`           |
| Filter generation  | Aggregation pipeline computes real values, no stale hardcoded lists    |
| Schema flexibility | `Mixed` type attributes map — no migration needed for new categories   |
