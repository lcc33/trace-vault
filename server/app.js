const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

require('dotenv').config();

const app = express();

// Connect MongoDB
connectDB();

app.use(cors());
app.use(express.json());

// Set view engine
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/', require('./routes/reportRoutes'));

// Example admin dashboard route
app.get('/admin', (req, res) => {
  res.render('index', { title: 'Admin Dashboard' });
});

const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
