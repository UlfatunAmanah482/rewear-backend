const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Ambil semua produk
exports.getAllProducts = async (req, res) => {
  const products = await prisma.product.findMany();
  res.json(products);
};

exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phone: true
          }
        }
      }
    });

    if (!product) {
      return res.status(404).json({ message: "Produk tidak ditemukan" });
    }

    res.json(product);
  } catch (err) {
    console.error("Error getProductById:", err);
    res.status(500).json({ message: "Gagal mengambil detail produk", error: err.message });
  }
};

// Tambah Produk
exports.createProduct = async (req, res) => {
  const { title, description, price, category, image, address } = req.body;
  const product = await prisma.product.create({
    data: { title, description, price: parseFloat(price), category, image, address, userId: req.user.id }
  });
  res.json(product);
};

// Update Produk (Bisa oleh pemilik atau Admin)
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, price, category, image } = req.body;

    // 1. Cari produknya dulu
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) }
    });

    if (!product) {
      return res.status(404).json({ message: "Produk tidak ditemukan" });
    }

    // 2. Cek Keamanan: Apakah yang edit adalah pemiliknya atau seorang ADMIN?
    if (product.userId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: "Anda tidak memiliki akses untuk mengedit produk ini" });
    }

    // 3. Lakukan Update
    const updatedProduct = await prisma.product.update({
      where: { id: parseInt(id) },
      data: {
        title: title || product.title,
        description: description || product.description,
        price: price ? parseFloat(price) : product.price,
        category: category || product.category,
        image: image || product.image
      }
    });

    res.json({ 
      message: "Produk berhasil diperbarui", 
      product: updatedProduct 
    });

  } catch (err) {
    console.error("Error updateProduct:", err);
    res.status(500).json({ message: "Gagal mengupdate produk", error: err.message });
  }
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