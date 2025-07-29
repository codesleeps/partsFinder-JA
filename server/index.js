const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database setup
const db = new sqlite3.Database('./database.db', (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to SQLite database');
    initializeDatabase();
  }
});

// Initialize database tables
function initializeDatabase() {
  db.serialize(() => {
    // Users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE,
      name TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Search history table
    db.run(`CREATE TABLE IF NOT EXISTS search_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      vehicle_make TEXT,
      vehicle_model TEXT,
      vehicle_year INTEGER,
      part_category TEXT,
      search_query TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )`);

    // Vehicle data cache table
    db.run(`CREATE TABLE IF NOT EXISTS vehicle_cache (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      make TEXT,
      model TEXT,
      year INTEGER,
      data TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
  });
}

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Auto Parts Finder API is running' });
});

// Get vehicle makes
app.get('/api/vehicles/makes', async (req, res) => {
  try {
    // Mock data for now - replace with actual API calls
    const makes = [
      'Toyota', 'Honda', 'Ford', 'Chevrolet', 'BMW', 'Mercedes-Benz',
      'Audi', 'Volkswagen', 'Nissan', 'Hyundai', 'Kia', 'Mazda'
    ];
    res.json(makes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch vehicle makes' });
  }
});

// Get vehicle models by make
app.get('/api/vehicles/models/:make', async (req, res) => {
  try {
    const { make } = req.params;
    // Mock data - replace with actual API integration
    const modelsByMake = {
      'Toyota': ['Camry', 'Corolla', 'RAV4', 'Highlander', 'Prius'],
      'Honda': ['Civic', 'Accord', 'CR-V', 'Pilot', 'Fit'],
      'Ford': ['F-150', 'Mustang', 'Explorer', 'Focus', 'Escape']
    };
    
    const models = modelsByMake[make] || [];
    res.json(models);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch vehicle models' });
  }
});

// Search parts with enhanced mock data
app.post('/api/parts/search', async (req, res) => {
  try {
    const { make, model, year, category, query, userId } = req.body;
    
    // Save search to history
    if (userId) {
      db.run(
        `INSERT INTO search_history (user_id, vehicle_make, vehicle_model, vehicle_year, part_category, search_query)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [userId, make, model, year, category, query]
      );
    }

    // Enhanced mock parts data with more realistic information
    const brands = ['OEM', 'Bosch', 'ACDelco', 'Motorcraft', 'Beck Arnley', 'Febi', 'Gates', 'NGK'];
    const availabilityOptions = ['In Stock', 'Limited Stock', 'Out of Stock'];
    
    const mockParts = Array.from({ length: Math.floor(Math.random() * 15) + 8 }, (_, index) => {
      const brand = brands[Math.floor(Math.random() * brands.length)];
      const basePrice = Math.floor(Math.random() * 400) + 25;
      const availability = availabilityOptions[Math.floor(Math.random() * availabilityOptions.length)];
      
      return {
        id: index + 1,
        name: `${category} for ${year} ${make} ${model}`,
        partNumber: 'AP-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
        price: basePrice,
        originalPrice: Math.random() > 0.7 ? basePrice + Math.floor(Math.random() * 50) : null,
        brand: brand,
        availability: availability,
        description: `High-quality ${category.toLowerCase()} compatible with ${year} ${make} ${model}`,
        fullDescription: `This ${category.toLowerCase()} is specifically designed for your ${year} ${make} ${model}. Manufactured by ${brand}, it meets or exceeds OEM specifications and comes with a comprehensive warranty.`,
        rating: Math.floor(Math.random() * 2) + 4, // 4-5 stars
        reviewCount: Math.floor(Math.random() * 200) + 10,
        isOEM: brand === 'OEM',
        warranty: Math.random() > 0.5 ? '2 Year' : '1 Year',
        weight: (Math.random() * 10 + 0.5).toFixed(1),
        dimensions: `${(Math.random() * 10 + 5).toFixed(1)}" x ${(Math.random() * 8 + 3).toFixed(1)}" x ${(Math.random() * 6 + 2).toFixed(1)}"`,
        category: category,
        compatibility: `${year} ${make} ${model}`,
        engineTypes: ['2.4L 4-Cyl', '3.5L V6'].slice(0, Math.floor(Math.random() * 2) + 1),
        features: [
          'High-quality materials',
          'Perfect fit guarantee',
          'Easy installation',
          'Tested for durability',
          'Corrosion resistant',
          'Temperature resistant'
        ].slice(0, Math.floor(Math.random() * 4) + 2),
        notes: Math.random() > 0.5 ? 'Professional installation recommended' : null
      };
    });

    res.json(mockParts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to search parts' });
  }
});

// Get search history
app.get('/api/search-history/:userId', (req, res) => {
  const { userId } = req.params;
  
  db.all(
    `SELECT * FROM search_history WHERE user_id = ? ORDER BY created_at DESC LIMIT 10`,
    [userId],
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: 'Failed to fetch search history' });
      } else {
        res.json(rows);
      }
    }
  );
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});