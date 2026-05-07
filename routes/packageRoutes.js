const express = require('express');
const router = express.Router();
const pkg = require('../controllers/packageController');
const auth = require('../middleware/authMiddleware');
const authController = require("../controllers/authController");

// ✅ 👉 IMPORTANTE: export VA ANTES DE RUTAS DINÁMICAS
router.get("/export", auth(), pkg.exportPackages);
router.get("/metrics", auth(), pkg.getMetrics);


// rutas protegidas
router.get('/', auth(['admin','cliente']), pkg.getPackages);
router.post('/', auth(['admin','cliente']), pkg.registerPackage);
router.put('/:id', auth(['admin']), pkg.updatePackage);
router.delete('/:id', auth(['admin']), pkg.deletePackage);
router.put('/:id/status', auth(['admin']), pkg.updateStatus);
router.post("/create-user", auth(["admin"]), authController.createUser);
router.get('/track/:tracking', pkg.getPackageByTracking);
router.get("/dashboard-data", auth(["admin"]), authController.getDashboardData)




module.exports = router;
