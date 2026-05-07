const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/mailer");


// ✅ CREATE USER (ADMIN)
exports.createUser = async (req, res) => {
  try {

    const {
      identidad,
      name,
      apellido,
      sexo,
      fecha_nacimiento,
      email,
      departamento,
      ciudad,
      telefono,
      tipo_envio,
      direccion,
      password,
      role
    } = req.body;

    // ✅ FUNCIÓN PARA LIMPIAR undefined
    const clean = (value) => value === undefined ? null : value;

    if (!name?.trim() || !email?.trim() || !password || !role) {
      return res.status(400).json({ msg: "Campos obligatorios" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.execute(`
      INSERT INTO users (
        identidad,
        name,
        apellido,
        sexo,
        fecha_nacimiento,
        email,
        departamento,
        ciudad,
        telefono,
        tipo_envio,
        direccion,
        password,
        role
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      clean(identidad),
      clean(name),
      clean(apellido),
      clean(sexo),
      clean(fecha_nacimiento),
      clean(email),
      clean(departamento),
      clean(ciudad),
      clean(telefono),
      clean(tipo_envio),
      clean(direccion),
      hashedPassword,
      clean(role)
    ]);

    res.json({ msg: "✅ Usuario creado correctamente" });

  } catch (error) {
    console.error("🔥 ERROR CREATE USER:", error);
    res.status(500).json({ msg: error.message });
  }
};

// ✅ LISTAR USUARIOS
exports.getUsers = async (req, res) => {
  try {
    const [rows] = await db.execute(
      "SELECT id, name, email, role FROM users"
    );

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error obteniendo usuarios" });
  }
};



// ✅ ACTUALIZAR ROL
exports.updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    await db.execute(
      "UPDATE users SET role = ? WHERE id = ?",
      [role, id]
    );

    res.json({ msg: "Rol actualizado" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error" });
  }
};


// ✅ ELIMINAR USUARIO
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params; // ✅ obtener ID correctamente

    if (!id) {
      return res.status(400).json({ msg: "ID requerido" });
    }

    await db.execute(
      "DELETE FROM users WHERE id = ?",
      [id]
    );

    res.json({ msg: "✅ Usuario eliminado correctamente" });

  } catch (error) {
    console.error("❌ ERROR DELETE USER:", error);
    res.status(500).json({ msg: "Error eliminando usuario" });
  }
};




// ✅ LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const [rows] = await db.execute(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      return res.status(400).json({ msg: "Usuario no encontrado" });
    }

    const user = rows[0];

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(400).json({ msg: "Contraseña incorrecta" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      token,
      user
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error servidor" });
  }
};


// ✅ REGISTER
exports.register = async (req, res) => {
  try {

    const {
      identidad,
      name,
      apellido,
      sexo,
      fecha_nacimiento,
      email,
      departamento,
      ciudad,
      telefono,
      tipo_envio,
      direccion,
      password
    } = req.body;

    if (!identidad || !name || !email || !password) {
      return res.status(400).json({
        msg: "Faltan datos obligatorios"
      });
    }

    const [exist] = await db.execute(
      "SELECT id FROM users WHERE identidad = ?",
      [identidad]
    );

    if (exist.length > 0) {
      return res.status(400).json({
        msg: "Este usuario ya está registrado"
      });
    }

    const locker = "LOCK-" + Math.random()
      .toString(36)
      .substring(2, 10)
      .toUpperCase();

    const hashed = await bcrypt.hash(password, 10);

    await db.execute(
      `
      INSERT INTO users (
        identidad,
        name,
        apellido,
        sexo,
        fecha_nacimiento,
        email,
        departamento,
        ciudad,
        telefono,
        tipo_envio,
        direccion,
        password,
        role,
        locker
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'cliente', ?)
      `,
      [
        identidad,
        name,
        apellido,
        sexo,
        fecha_nacimiento,
        email,
        departamento,
        ciudad,
        telefono,
        tipo_envio,
        direccion,
        hashed,
        locker
      ]
    );

    // ✅ CORREO
    try {
      await sendEmail(
        email,
        "Bienvenido a Tracking System",
        `<h2>✅ Registro exitoso</h2>
         <p>Hola ${name}</p>
         <h3>📦 Casillero: ${locker}</h3>`
      );

      console.log("✅ CORREO ENVIADO");

    } catch (err) {
      console.error("❌ ERROR EMAIL:", err);
    }

    res.json({
      msg: "Usuario registrado correctamente",
      locker
    });

  } catch (error) {
    console.error("ERROR REGISTER:", error);
    res.status(500).json({
      msg: "Error en el servidor"
    });
  }
};

exports.getDashboardData = async (req, res) => {
  try {

    const [transito] = await db.execute(
      "SELECT id, tracking FROM packages WHERE status = 'en_transito'"
    );

    const [bodega] = await db.execute(
      "SELECT id, tracking FROM packages WHERE status = 'en_bodega'"
    );

    // 🚨 ATRASADOS
    const [atrasados] = await db.execute(`
      SELECT id, tracking 
      FROM packages
      WHERE status = 'en_transito'
      AND created_at < NOW() - INTERVAL 5 DAY
    `);

    const [totalUsers] = await db.execute(
      "SELECT COUNT(*) as total FROM users"
    );

    const [lastUser] = await db.execute(
      "SELECT name, email FROM users ORDER BY id DESC LIMIT 1"
    );

    res.json({
      transito,
      bodega,
      atrasados, 
      totalUsuarios: totalUsers[0].total,
      ultimoUsuario: lastUser.length ? lastUser[0] : null
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error dashboard" });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const userId = req.user.id;

    let query = "UPDATE users SET name = ?, email = ?";
    let params = [name, email];

    if (password) {
      query += ", password = ?";
      params.push(password);
    }

    query += " WHERE id = ?";
    params.push(userId);

    await db.execute(query, params);

    res.json({ msg: "Perfil actualizado" });

  } catch (error) {
    res.status(500).json({ msg: "Error" });
  }
};

