exports.getDashboardData = async (req, res) => {
  try {

    const [transito] = await db.execute(
      "SELECT id, name FROM packages WHERE status = 'en_transito' LIMIT 5"
    );

    const [bodega] = await db.execute(
      "SELECT id, name FROM packages WHERE status = 'en_bodega' LIMIT 5"
    );

    const [usuarios] = await db.execute(
      "SELECT COUNT(*) as total FROM users"
    );

    const [ultimoUsuario] = await db.execute(
      "SELECT name, email FROM users ORDER BY id DESC LIMIT 1"
    );

    res.json({
      transito,
      bodega,
      totalUsuarios: usuarios[0].total,
      ultimoUsuario: ultimoUsuario[0] || null
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error dashboard" });
  }
};