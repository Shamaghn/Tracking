const jwt = require('jsonwebtoken');

const authMiddleware = (roles = []) => {
  return (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;

      // ✅ 1. Verificar si viene el token
      if (!authHeader) {
        return res.status(401).json({
          msg: "Acceso denegado: Token requerido"
        });
      }

      // ✅ 2. Validar formato Bearer TOKEN
      const parts = authHeader.split(' ');

      if (parts.length !== 2 || parts[0] !== 'Bearer') {
        return res.status(401).json({
          msg: "Formato de token inválido"
        });
      }

      const token = parts[1];

      // ✅ 3. Verificar token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // ✅ 4. Guardar usuario en request
      req.user = decoded;

      // ✅ 5. Validar roles
      if (roles.length > 0 && !roles.includes(decoded.role)) {
        return res.status(403).json({
          msg: "No tienes permisos para esta acción"
        });
      }

      // ✅ 6. Continuar
      next();

    } catch (error) {
      return res.status(401).json({
        msg: "Token inválido o expirado"
      });
    }
  };
};

module.exports = authMiddleware;
