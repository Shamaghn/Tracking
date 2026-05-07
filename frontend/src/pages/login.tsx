import { useState, useContext } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Login() {

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.email || !form.password) {
      return Swal.fire("Error", "Completa todos los campos", "error");
    }

    try {
      const res = await axios.post(
        "http://localhost:3000/api/auth/login",
        form
      );

      // ✅ GUARDAR TOKEN Y USUARIO
      login(res.data);

      await Swal.fire("Bienvenido", "Login correcto", "success");

      navigate("/");

    } catch (error) {
      Swal.fire("Error", "Credenciales incorrectas", "error");
    }
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center vh-100"
      style={{
        background: "linear-gradient(135deg, #1e3c72, #2a5298)"
      }}
    >

      <div
        className="card shadow p-4"
        style={{
          width: "350px",
          borderRadius: "15px"
        }}
      >

        {/* LOGO / TÍTULO */}
        <h3 className="text-center mb-2 text-primary">
          📦 Tracking System
        </h3>

        <p className="text-center text-muted mb-4">
          Iniciar sesión
        </p>

        {/* FORM */}
        <form onSubmit={handleSubmit}>

          <input
            type="email"
            name="email"
            className="form-control mb-2"
            placeholder="Correo"
            onChange={handleChange}
          />

          <input
            type="password"
            name="password"
            className="form-control mb-3"
            placeholder="Contraseña"
            onChange={handleChange}
          />

          <button className="btn btn-primary w-100 mb-3">
            Ingresar
          </button>

          {/* ✅ REGISTRO */}
          <p className="text-center mt-3">
            ¿No tienes cuenta?
          </p>

          <button
            type="button" // ✅ IMPORTANTE (evita submit del form)
            className="btn btn-outline-primary w-100"
            onClick={() => navigate("/register")}
          >
            Registrarse
          </button>

        </form>

        {/* DIVISOR */}
        <hr />

        {/* ✅ BOTÓN TRACKING */}
        <div className="text-center">

          <p className="text-muted mb-2">
            ¿Quieres rastrear un paquete?
          </p>

          <button
            type="button" // ✅ IMPORTANTE
            className="btn btn-outline-success w-100"
            onClick={() => navigate("/tracking")}
          >
            🔍 Rastrear paquete
          </button>

        </div>

      </div>

    </div>
  );
}
