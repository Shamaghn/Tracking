const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "mail.dplushn.com",
  port: 587,            // ✅ CAMBIO IMPORTANTE
  secure: false,        // ✅ IMPORTANTE
  auth: {
    user: "info@dplushn.com",
    pass: "Canales%1987"
  },
  tls: {
    rejectUnauthorized: false
  }
});

// ✅ VERIFICAR CONEXIÓN
transporter.verify((error, success) => {
  if (error) {
    console.log("❌ SMTP ERROR:", error);
  } else {
    console.log("✅ SMTP LISTO PARA ENVIAR");
  }
});

const sendEmail = async (to, subject, html) => {
  console.log("📤 Enviando correo a:", to);

  const info = await transporter.sendMail({
    from: '"Tracking System" <info@dplushn.com>',
    to,
    subject,
    html
  });

  console.log("✅ Email enviado:", info.response);
};

module.exports = sendEmail;
