const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { register, login } = require('./controllers/authController');
const { getAllProducts, createProduct, deleteProduct } = require('./controllers/productController');
const { verifyToken } = require('./middleware/auth');
const { getUser } = require('./controllers/userController');

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// Routes Auth
app.post('/api/register', register);
app.post('/api/login', login);

// Routes Produk
app.get('/api/products', getAllProducts);
app.post('/api/products', verifyToken, createProduct);
app.delete('/api/products/:id', verifyToken, deleteProduct);

//  Routes User
app.get('/api/user', verifyToken, getUser);

const PORT = 5000;
app.listen(PORT, () => console.log(`Backend jalan di port ${PORT}`));