const Product = require("../models/Product");
const Category = require("../models/Category");

const getFilters = async (req, res) => {
  try {
    const { category: categorySlug } = req.query;
    const baseMatch = { isActive: true };
    let category = null;
    if (categorySlug) {
      category = await Category.findOne({ slug: categorySlug, isActive: true });
      if (!category) {
        return res
          .status(404)
          .json({ success: false, message: "Category not found" });
      }
      baseMatch.category = category._id;
    }
    const priceAgg = await Product.aggregate([
      { $match: baseMatch },
      {
        $group: {
          _id: null,
          minPrice: { $min: "$price" },
          maxPrice: { $max: "$price" },
        },
      },
    ]);
    const filters = [
      {
        key: "price",
        label: "Price Range",
        type: "range",
        min: priceAgg[0]?.minPrice ?? 0,
        max: priceAgg[0]?.maxPrice ?? 100000,
        unit: "₹",
      },
    ];
    if (category) {
      for (const attrDef of category.attributes.filter((a) => a.filterable)) {
        const attrKey = `attributes.${attrDef.key}`;
        if (
          attrDef.type === "select" ||
          attrDef.type === "multiselect" ||
          attrDef.type === "text"
        ) {
          const distinctValues = await Product.distinct(attrKey, baseMatch);
          const validValues = distinctValues
            .filter((v) => v !== null && v !== undefined && v !== "")
            .sort();
          if (validValues.length > 0) {
            filters.push({
              key: attrDef.key,
              label: attrDef.label,
              type: "multiselect",
              options: validValues.map((v) => ({ label: v, value: v })),
              unit: attrDef.unit || "",
            });
          }
        } else if (attrDef.type === "number" || attrDef.type === "range") {
          const numAgg = await Product.aggregate([
            { $match: baseMatch },
            {
              $group: {
                _id: null,
                min: { $min: `$${attrKey}` },
                max: { $max: `$${attrKey}` },
              },
            },
          ]);
          if (numAgg[0] && numAgg[0].min !== null) {
            filters.push({
              key: attrDef.key,
              label: attrDef.label,
              type: "range",
              min: numAgg[0].min,
              max: numAgg[0].max,
              unit: attrDef.unit || "",
            });
          }
        } else if (attrDef.type === "boolean") {
          filters.push({
            key: attrDef.key,
            label: attrDef.label,
            type: "boolean",
          });
        }
      }
    } else {
      const categories = await Category.find({ isActive: true }).select(
        "name slug",
      );
      filters.unshift({
        key: "category",
        label: "Category",
        type: "multiselect",
        options: categories.map((c) => ({ label: c.name, value: c.slug })),
      });
    }
    res.json({ success: true, data: filters });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const searchProducts = async (req, res) => {
  try {
    const {
      q,
      category: categorySlug,
      page = 1,
      limit = 20,
      sort = "relevance",
      minPrice,
      maxPrice,
      ...rest
    } = req.query;
    const match = { isActive: true };

    // Category filter
    let category = null;
    if (categorySlug) {
      category = await Category.findOne({ slug: categorySlug, isActive: true });
      if (category) match.category = category._id;
    }

    // Price filter
    if (minPrice || maxPrice) {
      match.price = {};
      if (minPrice) match.price.$gte = Number(minPrice);
      if (maxPrice) match.price.$lte = Number(maxPrice);
    }

    // Dynamic attribute filters
    const ignoredKeys = new Set([
      "q",
      "category",
      "page",
      "limit",
      "sort",
      "minPrice",
      "maxPrice",
    ]);
    for (const [key, value] of Object.entries(rest)) {
      if (ignoredKeys.has(key)) continue;
      const values = Array.isArray(value) ? value : [value];
      match[`attributes.${key}`] =
        values.length === 1 ? values[0] : { $in: values };
    }

    // Regex search — no text index needed
    // Searching "mobile" finds all products in the Mobile category
    const pipeline = [];
    if (q && q.trim()) {
      const regex = new RegExp(q.trim(), "i");
      const matchedCategories = await Category.find(
        { name: regex, isActive: true },
        { _id: 1 },
      );
      const orConditions = [
        { name: regex },
        { description: regex },
        { tags: regex },
      ];
      if (matchedCategories.length > 0) {
        orConditions.push({
          category: { $in: matchedCategories.map((c) => c._id) },
        });
      }
      pipeline.push({ $match: { ...match, $or: orConditions } });
    } else {
      pipeline.push({ $match: match });
    }

    // Sort
    const sortMap = {
      relevance: { createdAt: -1 },
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      "price-asc": { price: 1 },
      "price-desc": { price: -1 },
      featured: { isFeatured: -1, createdAt: -1 },
    };
    pipeline.push({ $sort: sortMap[sort] || sortMap.newest });

    // Paginate
    const skip = (Number(page) - 1) * Number(limit);
    pipeline.push({
      $facet: {
        data: [
          { $skip: skip },
          { $limit: Number(limit) },
          {
            $lookup: {
              from: "categories",
              localField: "category",
              foreignField: "_id",
              as: "category",
            },
          },
          { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
          { $project: { __v: 0 } },
        ],
        total: [{ $count: "count" }],
      },
    });

    const [result] = await Product.aggregate(pipeline);
    const total = result.total[0]?.count ?? 0;

    res.json({
      success: true,
      data: result.data,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit)),
      },
      query: { q, category: categorySlug, sort, filters: rest },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getFilters, searchProducts };
