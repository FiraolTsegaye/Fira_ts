const express = require("express");
const db = require("./schema");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;
const SECRET_KEY = "super_secret_jwt_key_123";

app.use(cors());
app.use(express.json());

function authenticateToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) return res.status(401).json({ error: "Access denied" });

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.status(403).json({ error: "Invalid token" });
        req.user = user;
        next();
    });
}

app.post("/api/login", (req, res) => {
    const { email, password } = req.body;
    
    try {
        const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
        
        if (!user) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const isPasswordValid = bcrypt.compareSync(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const accessToken = jwt.sign({ email: user.email }, SECRET_KEY, { expiresIn: "1h" });
        res.json({ accessToken, has_setup: !!user.has_setup });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get("/api/me", authenticateToken, (req, res) => {
    try {
        const user = db.prepare("SELECT email, has_setup FROM users WHERE email = ?").get(req.user.email);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        res.json({ email: user.email, has_setup: !!user.has_setup });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post("/api/setup", authenticateToken, (req, res) => {
    const { newEmail, newPassword } = req.body;

    if (!newEmail || !newPassword) {
        return res.status(400).json({ error: "Email and password are required" });
    }

    try {
        const hashedPassword = bcrypt.hashSync(newPassword, 10);
        db.prepare("UPDATE users SET email = ?, password = ?, has_setup = 1 WHERE email = ?")
          .run(newEmail, hashedPassword, req.user.email);
          
        res.json({ message: "Credentials updated successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get("/api/portfolio", (req, res) => {
    try {
        const portfolio = db.prepare("SELECT * FROM portfolio WHERE id = 1").get();
        res.json(portfolio);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put("/api/portfolio", authenticateToken, (req, res) => {
    const { name, hero_text, about_me, email, social_links, years_learning, projects_built, technologies_used } = req.body;

    try {
        const stmt = db.prepare(`
            UPDATE portfolio 
            SET name = ?, hero_text = ?, about_me = ?, email = ?, social_links = ?, years_learning = ?, projects_built = ?, technologies_used = ? 
            WHERE id = 1
        `);
        
        stmt.run(name, hero_text, about_me, email, social_links, years_learning, projects_built, technologies_used);
        res.json({ message: "Portfolio updated successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.use("/admin", express.static(path.join(__dirname, "../frontend/admin")));

app.use(express.static(path.join(__dirname, "../frontend")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
});
