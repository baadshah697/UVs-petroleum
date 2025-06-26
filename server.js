require('dotenv').config();
const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const db = require('./models');
const sequelize = db.sequelize;
const Admin = db.Admin;
const Contact = db.Contact;

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ---------- Static Routes ----------
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public/index.html')));
app.get('/contact', (req, res) => res.sendFile(path.join(__dirname, 'public/contact.html')));
app.get('/news', (req, res) => res.sendFile(path.join(__dirname, 'public/news.html')));
app.get('/product', (req, res) => res.sendFile(path.join(__dirname, 'public/product.html')));
app.get('/services', (req, res) => res.sendFile(path.join(__dirname, 'public/services.html')));
app.get('/history', (req, res) => res.sendFile(path.join(__dirname, 'public/history.html')));
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'public/admin.html')));
app.get('/dashboard', (req, res) => res.sendFile(path.join(__dirname, 'public/dashboard.html')));

// ---------- Contact Form ----------
app.post('/contact-form', async (req, res) => {
  const { name, email, message } = req.body;
  try {
    await Contact.create({ name, email, message });
    res.send('✅ Thank you for contacting UV’s Petroleums!');
  } catch (error) {
    console.error('❌ Contact form error:', error.message);
    res.status(500).send('Something went wrong');
  }
});

// ---------- Admin Registration ----------
app.post('/admin/register', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existingAdmin = await Admin.findOne({ where: { email } });
    if (existingAdmin) return res.status(400).send('❌ Email already registered');

    const hashedPassword = await bcrypt.hash(password, 10);
    await Admin.create({ name, email, password: hashedPassword });

    res.status(201).send('✅ Admin registered');
  } catch (error) {
    console.error('❌ Registration error:', error.message);
    res.status(500).send('Registration failed');
  }
});

// ---------- Admin Login ----------
app.post('/admin/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await Admin.findOne({ where: { email } });
    if (!admin) return res.status(404).send('❌ Admin not found');

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(401).send('❌ Invalid password');

    // OPTIONAL: JWT token logic, not required unless protected routes are needed
    // const token = jwt.sign(
    //   { id: admin.id, email: admin.email },
    //   JWT_SECRET,
    //   { expiresIn: '1h' }
    // );

    // ✅ Redirect to dashboard
    res.redirect('/dashboard.html');
  } catch (error) {
    console.error('❌ Login error:', error.message);
    res.status(500).send('Login failed');
  }
});

// ---------- JWT Middleware (Optional) ----------
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).send('No token provided');

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(401).send('Invalid token');
  }
};

// ---------- Admin View Messages ----------
app.get('/admin/messages', authMiddleware, async (req, res) => {
  try {
    const messages = await Contact.findAll();
    res.json(messages);
  } catch (err) {
    console.error('❌ Failed to fetch messages:', err.message);
    res.status(500).send('Server error');
  }
});

// ---------- Start Server ----------
sequelize.sync().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
  });
});
