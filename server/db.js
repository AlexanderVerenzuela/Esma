const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new Database(dbPath);

// Create tables if they don't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
  );

  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    categoryId INTEGER NOT NULL,
    description TEXT,
    mainImage TEXT NOT NULL,
    gallery TEXT, -- JSON string array
    isFeatured INTEGER DEFAULT 0,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (categoryId) REFERENCES categories(id)
  );

  CREATE TABLE IF NOT EXISTS teams (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    year TEXT NOT NULL,
    name TEXT NOT NULL,
    image TEXT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Insert default categories if empty
const count = db.prepare('SELECT COUNT(*) as count FROM categories').get();
if (count.count === 0) {
  const insert = db.prepare('INSERT INTO categories (name) VALUES (?)');
  ['CLUBES', 'SELECCIONES', 'RETRO', 'EDICIÓN ESPECIAL'].forEach(c => insert.run(c));
}

module.exports = db;
