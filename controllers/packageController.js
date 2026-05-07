const { createPackage } = require('../models/packageModel');

exports.registerPackage = async (req, res) => {
  try {

    const { tracking, provider } = req.body;

    // ✅ VALIDAR CAMPOS
    if (!tracking || !provider) {
      return res.status(400).json({
        msg: "Todos los campos son obligatorios"
      });
    }

    // ✅ OBTENER USUARIO DESDE JWT (IMPORTANTE)
    const userId = req.user.id;

    // ✅ INSERTAR SIN LOCKER (backend lo controla todo)
 await db.execute(
  "INSERT INTO packages (user_id, tracking, provider, status, created_at) VALUES (?, ?, ?, ?, NOW())",
  [userId, tracking, provider, "En tránsito"]
);

    res.json({
      msg: "Paquete registrado correctamente"
    });

  } catch (error) {
    console.error("ERROR REGISTER PACKAGE:", error);
    res.status(500).json({ msg: "Error servidor" });
  }
};


const db = require('../config/db');

exports.getPackages = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { tracking, status, from, to } = req.query;

    let baseQuery = `
      FROM packages p
      JOIN users u ON p.user_id = u.id
      WHERE 1=1
    `;

    let params = [];

    // ✅ FILTRO POR ROL
    if (req.user.role === "cliente") {
      baseQuery += " AND p.user_id = ?";
      params.push(req.user.id);
    }

    // ✅ FILTRO POR TRACKING
    if (tracking) {
      baseQuery += " AND p.tracking LIKE ?";
      params.push(`%${tracking}%`);
    }

    // ✅ FILTRO POR ESTADO
    if (status) {
      baseQuery += " AND p.status = ?";
      params.push(status);
    }

    // ✅ FILTRO POR FECHAS
    if (from && to) {
      baseQuery += " AND DATE(p.created_at) BETWEEN ? AND ?";
      params.push(from, to);
    }

    // ✅ TOTAL
    const [countRows] = await db.execute(
      `SELECT COUNT(*) as total ${baseQuery}`,
      params
    );

    const total = countRows[0].total;

    // ✅ DATOS
    const [rows] = await db.execute(
      `
      SELECT p.*, u.locker
      ${baseQuery}
      ORDER BY p.id DESC
      LIMIT ? OFFSET ?
      `,
      [...params, limit, offset]
    );

    res.json({
      data: rows,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });

  } catch (error) {
    console.error("ERROR FILTROS:", error);
    res.status(500).json({ msg: "Error servidor" });
  }
};


const ExcelJS = require("exceljs");

exports.exportPackages = async (req, res) => {
  try {

    const { tracking, status, from, to } = req.query;

    let baseQuery = `
      SELECT p.*, u.locker
      FROM packages p
      JOIN users u ON p.user_id = u.id
      WHERE 1=1
    `;

    let params = [];

    if (tracking) {
      baseQuery += " AND p.tracking LIKE ?";
      params.push(`%${tracking}%`);
    }

    if (status) {
      baseQuery += " AND p.status = ?";
      params.push(status);
    }

    if (from && to) {
      baseQuery += " AND DATE(p.created_at) BETWEEN ? AND ?";
      params.push(from, to);
    }

    const [rows] = await db.execute(baseQuery, params);

    // ✅ CREAR EXCEL
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Paquetes");

    // ✅ ENCABEZADOS
    worksheet.columns = [
      { header: "ID", key: "id", width: 10 },
      { header: "Casillero", key: "locker", width: 20 },
      { header: "Tracking", key: "tracking", width: 20 },
      { header: "Proveedor", key: "provider", width: 20 },
      { header: "Estado", key: "status", width: 20 },
      { header: "Fecha", key: "created_at", width: 25 },
    ];

    // ✅ FILAS
    rows.forEach(pkg => {
      worksheet.addRow(pkg);
    });

    // ✅ ESTILO
    worksheet.getRow(1).font = { bold: true };

    // ✅ RESPUESTA
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=paquetes.xlsx"
    );

    await workbook.xlsx.write(res);

    res.end();

  } catch (error) {
    console.error("ERROR EXPORT:", error);
    res.status(500).json({ msg: "Error al exportar" });
  }
};


exports.getMetrics = async (req, res) => {
  try {

    const [rows] = await db.execute(`
      SELECT
        COUNT(*) as total,
        SUM(status = 'En tránsito') as en_transito,
        SUM(status = 'En bodega') as en_bodega,
        SUM(status = 'Entregado') as entregado
      FROM packages
    `);

    res.json(rows[0]);

  } catch (error) {
    console.error("ERROR METRICS:", error);
    res.status(500).json({ msg: "Error" });
  }
};



const sendEmail = require("../utils/mailer");

exports.updateStatus = async (req, res) => {
  try {
    console.log("🔄 CAMBIANDO ESTADO...");

    const { id } = req.params;
    const { status } = req.body;

    // ✅ 1. ACTUALIZAR
    await db.execute(
      "UPDATE packages SET status=? WHERE id=?",
      [status, id]
    );

    // ✅ 2. OBTENER DATOS
    const [rows] = await db.execute(
      `
      SELECT p.tracking, p.status, u.email, u.name
      FROM packages p
      JOIN users u ON p.user_id = u.id
      WHERE p.id = ?
      `,
      [id]
    );

    console.log("📦 DATOS QUERY:", rows);

    if (rows.length === 0) {
      console.log("❌ NO SE ENCONTRÓ USUARIO O PAQUETE");
      return res.json({ msg: "Estado actualizado SIN EMAIL" });
    }

    const pkg = rows[0];

    console.log("📧 Enviando a:", pkg.email);

    // ✅ MENSAJE
    let mensajeEstado = "";

    if (pkg.status === "En tránsito") {
      mensajeEstado = "🚚 Tu paquete va en camino.";
    } else if (pkg.status === "En bodega") {
      mensajeEstado = "📍 Tu paquete llegó a bodega.";
    } else if (pkg.status === "Entregado") {
      mensajeEstado = "✅ Tu paquete fue entregado.";
    }

    // ✅ 3. ENVIAR EMAIL
    try {
      await sendEmail(
        pkg.email,
        "📦 Actualización de paquete",
        `
        <h2>📦 Estado actualizado</h2>

        <p>Hola ${pkg.name},</p>

        <p>Tracking:</p>

        <h3>${pkg.tracking}</h3>

        <h3 style="color:green;">✅ ${pkg.status}</h3>

        <p>${mensajeEstado}</p>

        <hr>

        <p>Gracias por usar Tracking System 🚚</p>
        `
      );

      console.log("✅ EMAIL ENVIADO CORRECTAMENTE");

    } catch (err) {
      console.error("❌ ERROR EN EMAIL:", err);
    }

    res.json({ msg: "Estado actualizado correctamente" });

  } catch (error) {
    console.error("❌ ERROR GENERAL:", error);
    res.status(500).json({ msg: "Error actualizando estado" });
  }
};


exports.getPackageByTracking = async (req, res) => {
  try {
    const { tracking } = req.params;

    const [rows] = await db.execute(
      `
      SELECT p.*, u.locker
      FROM packages p
      JOIN users u ON p.user_id = u.id
      WHERE p.tracking LIKE ? OR u.locker LIKE ?
      `,
      [`%${tracking}%`, `%${tracking}%`]
    );

    if (rows.length === 0) {
      return res.status(404).json({ msg: "No encontrado" });
    }

    res.json(rows); // 🔥 ahora devuelve lista

  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error servidor" });
  }
};








exports.deletePackage = async (req, res) => {
  try {
    const { id } = req.params;

    await db.execute("DELETE FROM packages WHERE id = ?", [id]);

    res.json({ msg: "Eliminado correctamente" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error eliminando" });
  }
};

exports.updatePackage = async (req, res) => {
  try {
    const { id } = req.params;
    const { tracking, provider } = req.body;

    await db.execute(
      "UPDATE packages SET tracking=?, provider=? WHERE id=?",
      [tracking, provider, id]
    );

    res.json({ msg: "Actualizado" });

  } catch (err) {
    res.status(500).json({ msg: "Error actualizando" });
  }
};

