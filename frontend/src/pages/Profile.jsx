import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import Swal from "sweetalert2";

export default function Profile() {

  const { user } = useContext(AuthContext);

  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
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

    try {
      const token = localStorage.getItem("token");

      await axios.put(
        "http://localhost:3000/api/auth/update-profile",
        form,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      Swal.fire("✅ Actualizado", "Perfil actualizado correctamente", "success");

    } catch (error) {
      console.error(error);
      Swal.fire("❌ Error", "No se pudo actualizar", "error");
    }
  };

  return (
    <div className="container mt-4">

      <div className="card shadow p-4">

        {/* 👤 HEADER */}
        <div className="text-center mb-4">

          {/* AVATAR */}
          <div
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              margin: "auto",
              background: "linear-gradient(135deg, #0d6efd, #6610f2)",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "30px",
              fontWeight: "bold"
            }}
          >
            {user?.name?.charAt(0).toUpperCase()}
          </div>

          <h4 className="mt-3">{user?.name}</h4>
          <small className="text-muted">{user?.role}</small>

        </div>

        {/* ✅ FORMULARIO */}
        <form onSubmit={handleSubmit}>

          <div className="mb-3">
            <label className="form-label">Nombre</label>
            <input
              type="text"
              name="name"
              className="form-control"
              value={form.name}
              onChange={handleChange}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              name="email"
              className="form-control"
              value={form.email}
              onChange={handleChange}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Contraseña (opcional)</label>
            <input
              type="password"
              name="password"
              className="form-control"
              value={form.password}
              onChange={handleChange}
            />
          </div>

          <button className="btn btn-primary w-100">
            Guardar cambios
          </button>

        </form>

      </div>

    </div>
  );
}