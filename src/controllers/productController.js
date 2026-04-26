const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// 1. Ambil semua produk (Urutkan dari yang terbaru)
exports.getAllProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, role: true } }
      }
    });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: "Gagal mengambil produk" });
  }
};

// 2. Ambil detail produk
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: { select: { name: true, email: true, phone: true } }
      }
    });

    if (!product) return res.status(404).json({ message: "Produk tidak ditemukan" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: "Gagal mengambil detail produk" });
  }
};

// 3. Tambah Produk
exports.createProduct = async (req, res) => {
  try {
    const { title, description, price, category, image, address } = req.body;
    const product = await prisma.product.create({
      data: { 
        title, 
        description, 
        price: parseFloat(price), 
        category, 
        image, 
        address, 
        userId: req.user.id 
      }
    });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: "Gagal menambah produk" });
  }
};

// 4. Update Produk (Oleh Pemilik atau Admin)
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, price, category, image } = req.body;

    const product = await prisma.product.findUnique({ where: { id: parseInt(id) } });
    if (!product) return res.status(404).json({ message: "Produk tidak ditemukan" });

    // LOGIKA KEAMANAN: Pemilik atau ADMIN
    if (product.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: "Anda tidak memiliki akses untuk mengedit produk ini" });
    }

    const updatedProduct = await prisma.product.update({
      where: { id: parseInt(id) },
      data: {
        title: title || product.title,
        description: description || product.description,
        price: price ? parseFloat(price) : product.price,
        category: category || product.category,
        image: image || product.image,
      }
    });

    res.json({ message: "Produk berhasil diperbarui", updatedProduct });
  } catch (err) {
    console.error("Error updateProduct:", err);
    res.status(500).json({ message: "Gagal mengupdate produk", error: err.message });
  }
};

// 5. Hapus Produk (Oleh Pemilik atau Admin)
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Cari barangnya
    const product = await prisma.product.findUnique({ where: { id: parseInt(id) } });
    if (!product) return res.status(404).json({ message: "Produk tidak ditemukan" });

    // LOGIKA KEAMANAN: Izinkan jika dia pemiliknya ATAU dia seorang ADMIN
    const isOwner = product.userId === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ 
        message: "Anda tidak memiliki izin untuk menghapus produk ini" 
      });
    }

    await prisma.product.delete({ where: { id: parseInt(id) } });
    
    res.json({ 
      message: isAdmin ? "Produk dihapus oleh Admin" : "Produk berhasil Anda hapus" 
    });

  } catch (err) {
    console.error("Error deleteProduct:", err);
    res.status(500).json({ message: "Gagal menghapus produk" });
  }
};