const Database = require('better-sqlite3');
const bcrypt = require('bcrypt');

const db = new Database('app.db');
db.pragma('foreign_keys = ON');

function initDatabase() {
    const query = `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL,
      password TEXT NOT NULL,
      has_setup INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS portfolio (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      name TEXT,
      hero_text TEXT,
      about_me TEXT,
      email TEXT,
      social_links TEXT,
      years_learning TEXT,
      projects_built TEXT,
      technologies_used TEXT
    );

    INSERT OR IGNORE INTO portfolio (id, name, hero_text, about_me, email, social_links, years_learning, projects_built, technologies_used) 
    VALUES (1, 'Alex Morgan', 'I craft clean, responsive, and user-friendly web applications with attention to detail, performance, and modern web standards.', 'I am a passionate Frontend Developer dedicated to building efficient, accessible, and visual interface solutions.', 'alex.morgan@example.com', 'github.com/alexmorgan,linkedin.com/in/alexmorgan', '3+', '25+', '10+');
  `;
    db.exec(query);

    const user = db.prepare("SELECT * FROM users WHERE email = ?").get('admin@example.com');
    if (!user) {
        const hashedPassword = bcrypt.hashSync('password123', 10);
        db.prepare("INSERT INTO users (email, password, has_setup) VALUES (?, ?, ?)").run('admin@example.com', hashedPassword, 0);
    }
}

initDatabase();

module.exports = db;