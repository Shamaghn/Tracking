const express = require("express");
const router = express.Router();

// ✅ CONTROLLERS
const authController = require("../controllers/authController");

// ✅ MIDDLEWARE
const auth = require("../middleware/authMiddleware");

// ✅ RUTAS PÚBLICAS
router.post("/register", authController.register);
router.post("/login", authController.login);

// ✅ 🔐 CREATE USER (SOLO ADMIN)
router.post("/create-user", auth(["admin"]), authController.createUser);
router.get("/users", auth(["admin"]), authController.getUsers);
router.delete("/users/:id", auth(["admin"]), authController.deleteUser);
router.put("/users/:id/role", auth(["admin"]), authController.updateRole);
router.get("/dashboard-data", auth(["admin"]), authController.getDashboardData);
router.put("/update-profile", auth(["admin", "user"]), authController.updateProfile);




module.exports = router;
