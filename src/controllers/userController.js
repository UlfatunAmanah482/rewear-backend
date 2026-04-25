const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getUser = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!userId) {
      return res.status(401).json({ message: "ID User tidak ditemukan dalam token" });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: Number(userId) 
      },
      select: { 
        id: true, 
        email: true, 
        name: true,
        phone: true 
      }
    });

    if (!user) {
      return res.status(404).json({ message: "User tidak ditemukan di database" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error di getUser:", error);
    res.status(500).json({ 
      message: "Terjadi kesalahan pada server",
      error: error.message 
    });
  }
};