const Product = require('../models/Product');

// @desc    Get all products (with search and category filtering)
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res, next) => {
  try {
    const { category, search, q } = req.query;
    const queryObj = {};

    // Category filter
    if (category && category !== 'All' && category !== 'All Categories') {
      queryObj.category = { $regex: new RegExp('^' + category + '$', 'i') };
    }

    // Search query
    const searchQuery = search || q;
    if (searchQuery) {
      queryObj.$or = [
        { name: { $regex: searchQuery, $options: 'i' } },
        { description: { $regex: searchQuery, $options: 'i' } },
        { brand: { $regex: searchQuery, $options: 'i' } },
        { tags: { $regex: searchQuery, $options: 'i' } },
      ];
    }

    const products = await Product.find(queryObj).sort({ createdAt: -1 });
    res.status(200).json(products);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product by id
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json(product);
  } catch (error) {
    next(error);
  }
};

// Helper function to parse array fields from form data
const parseFormArray = (val) => {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  try {
    const parsed = JSON.parse(val);
    if (Array.isArray(parsed)) return parsed;
  } catch (e) {
    // Suppress parse error and fallback to comma splitting
  }
  return val.split(',').map((s) => s.trim()).filter(Boolean);
};

// Helper function to parse object fields from form data
const parseFormObject = (val) => {
  if (!val) return {};
  if (typeof val === 'object') return val;
  try {
    return JSON.parse(val);
  } catch (e) {
    return {};
  }
};

// @desc    Create a product (Admin only)
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res, next) => {
  try {
    const {
      name,
      description,
      brand,
      category,
      subCategory,
      price,
      originalPrice,
      discountPercentage,
      stock,
      colors,
      sizes,
      seller,
      specifications,
      tags,
      featured,
      isTrending,
    } = req.body;

    // Handle uploaded files
    const imagePaths = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        // Save relative URL path
        imagePaths.push(`/uploads/${file.filename}`);
      });
    }

    if (imagePaths.length === 0) {
      // Fallback placeholder if no image uploaded
      imagePaths.push('/images/product-placeholder.png');
    }

    const newProductData = {
      name,
      description,
      brand,
      category,
      subCategory,
      price: Number(price) || 0,
      originalPrice: originalPrice ? Number(originalPrice) : undefined,
      discountPercentage: discountPercentage ? Number(discountPercentage) : 0,
      stock: Number(stock) || 0,
      seller: seller || 'MyShop',
      images: imagePaths,
      thumbnail: imagePaths[0],
      colors: parseFormArray(colors),
      sizes: parseFormArray(sizes),
      tags: parseFormArray(tags),
      specifications: parseFormObject(specifications),
      featured: featured === 'true' || featured === true,
      isTrending: isTrending === 'true' || isTrending === true,
      rating: 4.5, // Seed default rating for newly created products
      totalReviews: 0,
    };

    const product = await Product.create(newProductData);
    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a product (Admin only)
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const {
      name,
      description,
      brand,
      category,
      subCategory,
      price,
      originalPrice,
      discountPercentage,
      stock,
      colors,
      sizes,
      seller,
      specifications,
      tags,
      featured,
      isTrending,
    } = req.body;

    // Handle new uploaded files if any
    let imagePaths = [...product.images];
    if (req.files && req.files.length > 0) {
      const newPaths = req.files.map((file) => `/uploads/${file.filename}`);
      // Replace or append. Let's replace images with new ones if files are uploaded
      imagePaths = newPaths;
    }

    const updateData = {
      name: name !== undefined ? name : product.name,
      description: description !== undefined ? description : product.description,
      brand: brand !== undefined ? brand : product.brand,
      category: category !== undefined ? category : product.category,
      subCategory: subCategory !== undefined ? subCategory : product.subCategory,
      price: price !== undefined ? Number(price) : product.price,
      originalPrice: originalPrice !== undefined ? (originalPrice ? Number(originalPrice) : null) : product.originalPrice,
      discountPercentage: discountPercentage !== undefined ? Number(discountPercentage) : product.discountPercentage,
      stock: stock !== undefined ? Number(stock) : product.stock,
      seller: seller !== undefined ? seller : product.seller,
      images: imagePaths,
      thumbnail: imagePaths.length > 0 ? imagePaths[0] : product.thumbnail,
      colors: colors !== undefined ? parseFormArray(colors) : product.colors,
      sizes: sizes !== undefined ? parseFormArray(sizes) : product.sizes,
      tags: tags !== undefined ? parseFormArray(tags) : product.tags,
      specifications: specifications !== undefined ? parseFormObject(specifications) : product.specifications,
      featured: featured !== undefined ? (featured === 'true' || featured === true) : product.featured,
      isTrending: isTrending !== undefined ? (isTrending === 'true' || isTrending === true) : product.isTrending,
    };

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    res.status(200).json(updatedProduct);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a product (Admin only)
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await Product.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
