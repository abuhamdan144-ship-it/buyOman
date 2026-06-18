/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BuyOman Node.js Backend API Server
 * Connects to MongoDB Atlas and exposes standard REST API endpoints for product data.
 */

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000; // Use port 4000 for the standalone server to prevent port 3000 conflicts with standard dev server

// 1. Enable Cross-Origin Resource Sharing (CORS)
app.use(cors({
  origin: '*', // Allows all origins, perfect for local testing and cross-origin frontend integrations
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Apply JSON payload parse middleware
app.use(express.json());

// 2. Simple Custom Connection and Request Logger Middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url} - IP: ${req.ip}`);
  next();
});

// 3. MongoDB Atlas Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://abuhamdan144_db_user:sicplb7J9n1X3k6d@buyoman.muidenq.mongodb.net/?appName=buyOman';

console.log('Connecting to MongoDB Atlas...');
mongoose.connect(MONGODB_URI, {
  dbName: 'buyOman' // Specify target database explicitly
})
.then(async () => {
  console.log('✅ Successfully connected to MongoDB Atlas (Database: buyOman)');
  // Seed database with premium default products if empty
  await seedDatabase();
})
.catch((err) => {
  console.error('❌ MongoDB Atlas connection error:', err.message);
});

// 4. Mongoose Schema & Model definition for BuyOman Products
const productSchema = new mongoose.Schema({
  id: { type: Number, unique: true }, // Custom relative numeric identifier
  name: { type: String, required: true },
  brand: { type: String, required: true },
  emoji: { type: String, default: '📦' },
  price: { type: Number, required: true },
  oldPrice: { type: Number },
  rating: { type: Number, default: 5 },
  reviews: { type: Number, default: 0 },
  badge: { type: String, default: '' },
  category: { type: String, required: true },
  description: { type: String, default: '' },
  specs: { type: [String], default: [] },
  featured: { type: Boolean, default: false }
}, {
  timestamps: true // Auto-appends createdAt and updatedAt
});

const ProductModel = mongoose.model('Product', productSchema);

// 5. Database Auto-Seeding Script
// Seeds standard electronic items & small lifestyle devices if the database is brand new and empty
async function seedDatabase() {
  try {
    const count = await ProductModel.countDocuments();
    if (count > 0) {
      console.log(`ℹ️ Products database already carries ${count} catalog items. Skipping auto-seed.`);
      return;
    }

    console.log('🌱 Database is empty. Commencing auto-seeding with premium BuyOman electronics...');
    
    // Core components from data.ts
    const seedProducts = [
      {
        id: 1,
        name: "iPhone 15 Pro Max (256GB)",
        brand: "Apple",
        emoji: "📱",
        price: 459.900,
        oldPrice: 499.900,
        rating: 4.9,
        reviews: 1420,
        badge: "new",
        category: "mobile",
        description: "Forged in aerospace-grade titanium, featuring the revolutionary A17 Pro chip, customizable Action button, and the most powerful iPhone camera system ever with 5x optical zoom.",
        specs: ["Titanium Design", "A17 Pro Bionic Chip", "6.7-inch Super Retina XDR", "48MP Pro Camera System", "USB-C Connector"],
        featured: true
      },
      {
        id: 2,
        name: "Samsung Galaxy S24 Ultra (512GB)",
        brand: "Samsung",
        emoji: "📱",
        price: 389.900,
        oldPrice: 449.900,
        rating: 4.8,
        reviews: 987,
        badge: "hot",
        category: "mobile",
        description: "Welcome to the era of mobile AI. With Galaxy S24 Ultra in your hands, you can unleash whole new levels of creativity, productivity and possibility, backed by built-in S Pen.",
        specs: ["Built-in S Pen", "Snapdragon 8 Gen 3 for Galaxy", "200MP Quad Telephoto Zoom", "Dynamic AMOLED 2X Display", "5000mAh Battery"],
        featured: true
      },
      {
        id: 3,
        name: "MacBook Pro 14\" M3 (16GB/512GB)",
        brand: "Apple",
        emoji: "💻",
        price: 689.000,
        oldPrice: 749.000,
        rating: 4.9,
        reviews: 654,
        badge: "new",
        category: "laptop",
        description: "The 14-inch MacBook Pro blasts forward with M3, an incredibly advanced chip that brings serious speed and capability for daily productivity, coding, and casual gaming.",
        specs: ["Apple M3 Chip", "16GB Unified Memory", "Liquid Retina XDR Display", "Up to 22 Hours Battery Life", "Space Gray Premium Finish"],
        featured: true
      },
      {
        id: 4,
        name: "Samsung Neo QLED 8K Smart TV 65\"",
        brand: "Samsung",
        emoji: "📺",
        price: 899.000,
        oldPrice: 1099.000,
        rating: 4.7,
        reviews: 210,
        badge: "sale",
        category: "tv",
        description: "Immerse yourself deep inside ultra-sharp 8K resolution, powered by Neo Quantum HDR 8K+ and AI-powered upscaling technology that makes everything look jaw-droppingly vivid.",
        specs: ["Real 8K Resolution", "Quantum Matrix Technology Pro", "Object Tracking Sound+ (OTS+)", "Smart Hub & Gaming Hub", "Anti-Reflection Panel"],
        featured: true
      },
      {
        id: 5,
        name: "Sony WH-1000XM5 ANC Headphones",
        brand: "Sony",
        emoji: "🎧",
        price: 89.900,
        oldPrice: 129.900,
        rating: 4.9,
        reviews: 3120,
        badge: "best",
        category: "accessory",
        description: "With two processors controlling eight microphones, Auto NC Optimizer for automatically optimizing noise canceling, and a specially designed driver unit, experience next-level acoustic bliss.",
        specs: ["Auto NC Optimizer Noise Canceling", "Custom 30mm Driver Unit", "Up to 30-Hour Battery with Quick Charge", "Ultra-comfortable Lightweight Design", "High-Resolution Audio Wireless"],
        featured: false
      },
      {
        id: 6,
        name: "LG DUAL Inverter AC Split 2.0 Ton",
        brand: "LG",
        emoji: "❄️",
        price: 199.000,
        oldPrice: 259.000,
        rating: 4.6,
        reviews: 435,
        badge: "sale",
        category: "appliance",
        description: "Combat the Omani summer heat easily with LG’s DUAL Inverter Compressor. Save up to 70% energy while enjoying high-speed cooling and reliable anti-corrosive Gold Fin technology.",
        specs: ["DUAL Inverter Compressor", "Fast Cooling & Energy Saving", "Gold Fin Anti-Corrosion Shield", "Super Silent Operation", "Tropical T3 Compressor Tested"],
        featured: true
      },
      {
        id: 7,
        name: "Xiaomi 14 Ultra 5G (512GB)",
        brand: "Xiaomi",
        emoji: "📱",
        price: 329.900,
        oldPrice: 369.900,
        rating: 4.7,
        reviews: 145,
        badge: "hot",
        category: "mobile",
        description: "Co-engineered with Leica, featuring a legendary quad-camera system with a 1-inch main sensor and infinite variable aperture for professional film-quality photography right on your phone.",
        specs: ["Leica Leica Summilux Optics", "Snapdragon 8 Gen 3", "WQHD+ Dynamic AMOLED", "90W HyperCharge + 80W Wireless", "Xiaomi Guardian Structure Protection"],
        featured: false
      },
      {
        id:8,
        name: "LG OLED evo C3 Series 55\" 4K TV",
        brand: "LG",
        emoji: "📺",
        price: 489.000,
        oldPrice: 599.000,
        rating: 4.9,
        reviews: 876,
        badge: "best",
        category: "tv",
        description: "The OLED evo C3 is powered by the ultra-powerful Alpha9 Gen6 AI Processor 4K. Experience infinite contrast, perfectly deep blacks, and exceptional brightness for cinema and next-gen gaming.",
        specs: ["Self-Lit OLED Pixels", "Alpha 9 Gen 6 AI Processor 4K", "120Hz Refresh Rate with G-Sync & FreeSync", "Dolby Vision IQ & Dolby Atmos", "LG webOS 23 Smart Platform"],
        featured: false
      },
      {
        id: 9,
        name: "Bosch Serie 6 Front Loader 9kg",
        brand: "Bosch",
        emoji: "🧺",
        price: 169.900,
        oldPrice: 219.900,
        rating: 4.8,
        reviews: 512,
        badge: "sale",
        category: "appliance",
        description: "Bosch washing machine with EcoSilence Drive: enjoy extremely quiet operation and excellent durability. SpeedPerfect decreases cycle duration by up to 65% with optimal clean results.",
        specs: ["9kg Drum Capacity", "EcoSilence Drive Inverter", "SpeedPerfect Speed-up System", "VarioDrum Gentle Fiber Care", "AntiVibration Noise-muffling Sidewalls"],
        featured: false
      },
      {
        id: 10,
        name: "Asus ROG Zephyrus G16 (2024)",
        brand: "Asus",
        emoji: "💻",
        price: 799.000,
        oldPrice: 899.000,
        rating: 4.7,
        reviews: 188,
        badge: "hot",
        category: "laptop",
        description: "A super-slim gaming powerhouse. Features the Intel Core Ultra 9 processor, NVIDIA GeForce RTX 4070 graphics, and a gorgeous ROG Nebula OLED display with G-Sync capabilities.",
        specs: ["Intel Core Ultra 9 Processor", "NVIDIA RTX 4070 8GB GDDR6", "16-inch 2.5K Nebula OLED 240Hz", "32GB LPDDR5X RAM", "ROG Intelligent Cooling Liquid Metal"],
        featured: false
      },
      {
        id: 11,
        name: "Apple Watch Series 10 Titanium",
        brand: "Apple",
        emoji: "⌚",
        price: 189.900,
        oldPrice: 219.900,
        rating: 4.8,
        reviews: 580,
        badge: "new",
        category: "accessory",
        description: "Our thinnest, lightest design yet. Advanced health tracking metrics including ECG, Sleep Apnea notifications, automatic workout detection, and double-tap finger gesture controls.",
        specs: ["Polished Aerospace Titanium Case", "S10 SiP with Dual-Core Processor", "Sleep Apnea & ECG Tracking", "Double Tap Gesture Interface", "Fastest Battery Charging Ever"],
        featured: false
      },
      {
        id: 12,
        name: "Samsung French Door Refrigerator 620L",
        brand: "Samsung",
        emoji: "🧊",
        price: 299.900,
        oldPrice: 359.000,
        rating: 4.7,
        reviews: 195,
        badge: "best",
        category: "appliance",
        description: "Huge capacity smart refrigerator with Twin Cooling Plus technology. Optimizes the temperature and humidity in both fridges and freezers using completely independent cooling circuits.",
        specs: ["620 Litres Raw Capacity", "Twin Cooling Plus Moist Keep", "Smart Conversion 5-in-1 Modes", "Digital Inverter Compressor 20Y Warranty", "Fingerprint Resistant Coat Finish"],
        featured: false
      },
      // Small Appliances array integrated
      {
        id: 13,
        name: "Philips Essential Airfryer XL",
        brand: "Philips",
        emoji: "🍟",
        price: 39.900,
        oldPrice: 59.900,
        rating: 4.8,
        reviews: 340,
        badge: "best",
        category: "appliance",
        description: "Delicious fries with up to 90% less fat, thanks to Rapid Air technology. Includes touchscreen controls with 7 presets.",
        specs: ["Rapid Air technology", "XL Capacity 6.2L (1.2kg)", "Touch Screen with 7 Presets", "Keep Warm Function", "Recipe App Included"],
        featured: false
      },
      {
        id: 14,
        name: "Nespresso Vertuo Pop Coffee Maker",
        brand: "Nespresso",
        emoji: "☕",
        brand: "Nespresso",
        price: 69.900,
        oldPrice: 89.900,
        rating: 4.7,
        reviews: 180,
        badge: "hot",
        category: "accessory",
        description: "Convenient coffee maker for 4 cup sizes, featuring Centrifusion technology to read capsule barcodes and brew quality coffee with rich cream.",
        specs: ["Centrifusion Technology", "Reads Capsule Barcodes", "Brews 4 Cup Sizes", "Bluetooth/Wi-Fi Connection", "Compact & Colorful Design"],
        featured: false
      },
      {
        id: 15,
        name: "Dyson V11 Cord-Free Vacuum",
        brand: "Dyson",
        emoji: "🧹",
        price: 179.900,
        oldPrice: 209.900,
        rating: 4.9,
        reviews: 820,
        badge: "best",
        category: "appliance",
        description: "Intelligently optimizes suction and run time on all floor types. High Torque cleaner head auto-adapts to carpets and hard floors.",
        specs: ["Dynamic Load Sensor", "High Torque Cleaner Head", "60 Minutes Fading-free Runtime", "Real-time LCD Screen Report", "99.97% Microscopic Filtration"],
        featured: false
      }
    ];

    await ProductModel.insertMany(seedProducts);
    console.log('🎉 Seeding completed successfully! 15 premium products imported to BuyOman collection.');
  } catch (err) {
    console.error('⚠️ Could not complete auto-seeding of database:', err.message);
  }
}

// 6. REST API Endpoints implementation

// Helper to find highest ID and compute auto-progressive key
async function generateNextId() {
  const maxProduct = await ProductModel.findOne().sort('-id');
  return maxProduct && maxProduct.id ? maxProduct.id + 1 : 1;
}

// ROOT STATUS GATE
app.get('/api', (req, res) => {
  res.json({
    message: "Welcome to BuyOman Electronic Store Service Gateway",
    version: "1.0.0",
    endpoints: {
      getAllProducts: "GET /api/products",
      getFeatured: "GET /api/products/featured",
      getProductsByCategory: "GET /api/products/category/:category",
      searchProducts: "GET /api/products/search?q=searchterm",
      getProductById: "GET /api/products/:id",
      addProduct: "POST /api/products",
      updateProduct: "PUT /api/products/:id",
      deleteProduct: "DELETE /api/products/:id"
    }
  });
});

// GET FEATURED PRODUCTS
// This must be placed above general GET /api/products/:id to prevent URL capturing
app.get('/api/products/featured', async (req, res) => {
  try {
    const featured = await ProductModel.find({ featured: true });
    res.json({
      success: true,
      count: featured.length,
      data: featured
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Database search failure', details: err.message });
  }
});

// GET PRODUCTS BY CATEGORY
// This must be placed above general GET /api/products/:id to prevent URL capturing
app.get('/api/products/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    // Uses case-insensitive regex for elastic category matches
    const matchedProducts = await ProductModel.find({ 
      category: { $regex: new RegExp(`^${category}$`, 'i') } 
    });

    res.json({
      success: true,
      count: matchedProducts.length,
      data: matchedProducts
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Database category lookup failure', details: err.message });
  }
});

// GET PRODUCTS BY SEARCH TERM
// Endpoint: /api/products/search?q=term
// This must be placed above general GET /api/products/:id to prevent URL capturing
app.get('/api/products/search', async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing query parameter. Please query via /api/products/search?q=term' 
      });
    }

    const reg = new RegExp(query.toString(), 'i');
    const results = await ProductModel.find({
      $or: [
        { name: reg },
        { brand: reg },
        { category: reg },
        { description: reg }
      ]
    });

    res.json({
      success: true,
      count: results.length,
      data: results
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Database search computation failure', details: err.message });
  }
});

// GET ALL PRODUCTS
app.get('/api/products', async (req, res) => {
  try {
    const products = await ProductModel.find({}).sort({ id: 1 });
    res.json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Could not fetch database items list', details: err.message });
  }
});

// GET SINGLE PRODUCT (by sequential relative `id` OR MongoDB ObjectId `_id`)
app.get('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let product = null;

    // A: Try retrieving by ObjectId
    if (mongoose.Types.ObjectId.isValid(id)) {
      product = await ProductModel.findById(id);
    }

    // B: Try retrieving by custom relative sequential number id field
    if (!product) {
      const parsedNum = parseInt(id, 10);
      if (!isNaN(parsedNum)) {
        product = await ProductModel.findOne({ id: parsedNum });
      }
    }

    if (!product) {
      return res.status(404).json({
        success: false,
        error: `Could not locate product with ID: ${id}`
      });
    }

    res.json({
      success: true,
      data: product
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error during item retrieval', details: err.message });
  }
});

// POST - ADD NEW PRODUCT
app.post('/api/products', async (req, res) => {
  try {
    const { name, brand, emoji, price, oldPrice, category, description, specs, badge, rating, reviews, featured } = req.body;
    
    // Validations
    if (!name || !brand || price === undefined || !category) {
      return res.status(400).json({
        success: false,
        error: 'Missing required creation keys: name, brand, price, and category are required.'
      });
    }

    // Compute automatic progressive ID
    const nextId = await generateNextId();

    const newProduct = new ProductModel({
      id: nextId,
      name,
      brand,
      emoji: emoji || '📦',
      price: Number(price),
      oldPrice: oldPrice ? Number(oldPrice) : undefined,
      category,
      description: description || '',
      specs: Array.isArray(specs) ? specs : [],
      badge: badge || '',
      rating: rating || 5.0,
      reviews: reviews || 0,
      featured: !!featured
    });

    const saved = await newProduct.save();
    console.log(`[Success] Inserted new product with relative ID ${saved.id}: ${saved.name}`);

    res.status(201).json({
      success: true,
      message: 'New product added to catalog successfully',
      data: saved
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to create new catalog record', details: err.message });
  }
});

// PUT - UPDATE PRODUCT (by sequential relative `id` OR MongoDB ObjectId `_id`)
app.put('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let queryObj = {};

    // Determine query mechanism
    if (mongoose.Types.ObjectId.isValid(id)) {
      queryObj = { _id: id };
    } else {
      const parsedNum = parseInt(id, 10);
      if (isNaN(parsedNum)) {
        return res.status(400).json({ success: false, error: 'Invalid product key format' });
      }
      queryObj = { id: parsedNum };
    }

    // Ensure we convert numerical properties correctly if present
    const updateData = { ...req.body };
    if (updateData.price !== undefined) updateData.price = Number(updateData.price);
    if (updateData.oldPrice !== undefined) updateData.oldPrice = Number(updateData.oldPrice);
    if (updateData.rating !== undefined) updateData.rating = Number(updateData.rating);
    if (updateData.reviews !== undefined) updateData.reviews = Number(updateData.reviews);

    const updated = await ProductModel.findOneAndUpdate(
      queryObj,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        error: `Could not locate product record to update with ID: ${id}`
      });
    }

    console.log(`[Success] Updated specification contents for: ${updated.name}`);
    res.json({
      success: true,
      message: 'Catalog product specifications updated successfully',
      data: updated
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to update catalog specification', details: err.message });
  }
});

// DELETE - REMOVE PRODUCT (by sequential relative `id` OR MongoDB ObjectId `_id`)
app.delete('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let queryObj = {};

    // Determine target record lookup mechanisms
    if (mongoose.Types.ObjectId.isValid(id)) {
      queryObj = { _id: id };
    } else {
      const parsedNum = parseInt(id, 10);
      if (isNaN(parsedNum)) {
        return res.status(400).json({ success: false, error: 'Invalid product key format provided' });
      }
      queryObj = { id: parsedNum };
    }

    const deleted = await ProductModel.findOneAndDelete(queryObj);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: `Could not locate product record to delete with ID: ${id}`
      });
    }

    console.log(`[Success] Deleted and removed product catalog item: ${deleted.name}`);
    res.json({
      success: true,
      message: 'Product permanently removed from e-commerce inventory catalog',
      deletedId: id,
      data: deleted
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to delete custom catalog entry', details: err.message });
  }
});

// 7. Global fallback error handler for bad requests/mishaps
app.use((err, req, res, next) => {
  console.error('[Global Error Catch]:', err.stack);
  res.status(500).json({
    success: false,
    error: 'An unexpected application error was captured by the Express listener',
    message: err.message
  });
});

// Start listening for inbound calls
app.listen(PORT, '0.0.0.0', () => {
  console.log(`========================================================================`);
  console.log(`🚀 BUYOMAN STANDALONE NODE BACKEND ACTIVE ON PORT: ${PORT}`);
  console.log(`🌐 Ready for API requests on http://localhost:${PORT}`);
  console.log(`========================================================================`);
});
