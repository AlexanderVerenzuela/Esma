const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// Setup uploads folder
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Middleware
app.use(cors());
app.use(express.json());
// Serve static uploaded files
app.use('/uploads', express.static(uploadsDir));

// Multer setup for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// --- CATEGORIES API ---
app.get('/api/categories', (req, res) => {
  const categories = db.prepare('SELECT * FROM categories').all();
  res.json(categories);
});

app.post('/api/categories', (req, res) => {
  const { name } = req.body;
  try {
    const info = db.prepare('INSERT INTO categories (name) VALUES (?)').run(name);
    res.json({ id: info.lastInsertRowid, name });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/categories/:id', (req, res) => {
  const { id } = req.params;
  try {
    // Check if category is in use
    const inUse = db.prepare('SELECT COUNT(*) as count FROM products WHERE categoryId = ?').get(id);
    if (inUse.count > 0) {
      return res.status(400).json({ error: 'Cannot delete category in use by products' });
    }
    db.prepare('DELETE FROM categories WHERE id = ?').run(id);
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// --- PRODUCTS API ---
app.get('/api/products', (req, res) => {
  const products = db.prepare(`
    SELECT p.*, c.name as categoryName 
    FROM products p 
    LEFT JOIN categories c ON p.categoryId = c.id
    ORDER BY p.createdAt DESC
  `).all();
  
  // Parse gallery JSON
  const formatted = products.map(p => ({
    ...p,
    isFeatured: p.isFeatured === 1,
    gallery: p.gallery ? JSON.parse(p.gallery) : []
  }));
  res.json(formatted);
});

app.post('/api/products', (req, res) => {
  const { code, name, categoryId, description, mainImage, gallery, isFeatured } = req.body;
  try {
    const info = db.prepare(`
      INSERT INTO products (code, name, categoryId, description, mainImage, gallery, isFeatured) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(code, name, categoryId, description, mainImage, JSON.stringify(gallery || []), isFeatured ? 1 : 0);
    res.json({ id: info.lastInsertRowid });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/products/:id', (req, res) => {
  const { id } = req.params;
  const { code, name, categoryId, description, mainImage, gallery, isFeatured } = req.body;
  try {
    db.prepare(`
      UPDATE products 
      SET code=?, name=?, categoryId=?, description=?, mainImage=?, gallery=?, isFeatured=?
      WHERE id=?
    `).run(code, name, categoryId, description, mainImage, JSON.stringify(gallery || []), isFeatured ? 1 : 0, id);
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/products/:id', (req, res) => {
  const { id } = req.params;
  try {
    db.prepare('DELETE FROM products WHERE id = ?').run(id);
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// --- TEAMS API ---
app.get('/api/teams', (req, res) => {
  try {
    const teams = db.prepare('SELECT * FROM teams ORDER BY createdAt DESC').all();
    res.json(teams);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/teams', (req, res) => {
  const { year, name, image } = req.body;
  try {
    const info = db.prepare('INSERT INTO teams (year, name, image) VALUES (?, ?, ?)').run(year, name, image);
    res.json({ id: info.lastInsertRowid });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/teams/:id', (req, res) => {
  const { id } = req.params;
  try {
    db.prepare('DELETE FROM teams WHERE id = ?').run(id);
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// --- IMAGE UPLOAD API ---
app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  // Return the URL path
  res.json({ url: \`http://localhost:3000/uploads/\${req.file.filename}\` });
});

app.listen(PORT, () => {
  console.log(\`Server running on http://localhost:\${PORT}\`);
});
