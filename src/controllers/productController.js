const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Ambil semua produk
exports.getAllProducts = async (req, res) => {
  const products = await prisma.product.findMany();
  res.json(products);
};

// Tambah Produk
exports.createProduct = async (req, res) => {
  const { title, description, price, category, image } = req.body;
  const product = await prisma.product.create({
    data: { title, description, price: parseFloat(price), category, image, userId: req.user.id }
  });
  res.json(product);
};

// Hapus Produk (Bisa oleh pemilik atau Admin)
exports.deleteProduct = async (req, res) => {
  const { id } = req.params;
  const product = await prisma.product.findUnique({ where: { id: parseInt(id) } });

  if (!product) return res.status(404).json({ message: "Produk tidak ditemukan" });

  // Cek apakah pemilik atau admin
  // if (product.userId !== req.user.id && req.user.role !== 'ADMIN') {
  //   return res.status(403).json({ message: "Tidak punya akses" });
  // }

  await prisma.product.delete({ where: { id: parseInt(id) } });
  res.json({ message: "Produk berhasil dihapus" });
};