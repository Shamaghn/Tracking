const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();
const authRoutes = require("./routes/authRoutes");
const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

// ✅ limiter antes de rutas
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});

app.use(limiter);

// ✅ rutas
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/packages', require('./routes/packageRoutes'));
app.use("/api/auth", authRoutes);
app.listen(3000, () => console.log('Servidor corriendo en puerto 3000'));
