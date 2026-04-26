const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  const { email, password, name, role, phone, address } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  
  try {
    const user = await prisma.user.create({
      data: { email, password: hashedPassword, name, role, phone, address }
    });
    res.json({ message: "User berhasil dibuat", user });
    
  } catch (err) {
    console.error("Error dari Prisma:", err);

    if (err.code === 'P2002') {
      return res.status(400).json({ message: "Email sudah terdaftar" });
    }

    res.status(500).json({ 
      message: "Terjadi kesalahan pada server", 
      error: err.message 
    });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: "Email atau password salah" });
  }

  const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
  res.json({ token, user: { id: user.id, name: user.name, role: user.role, email: user.email, address: user.address } });
};