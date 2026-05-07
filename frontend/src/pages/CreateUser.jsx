import { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

export default function CreateUser() {

  const [form, setForm] = useState({
    identidad: "",
    name: "",
    apellido: "",
    sexo: "",
    fecha: "",
    email: "",
    departamento: "",
    ciudad: "",
    telefono: "",
    tipo_envio: "",
    direccion: "",
    password: "",
    role: "cliente"
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

await axios.post(await  "http://localhost:3000/api/auth/create-user",
  form,
  {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`
    }
  }
);



      Swal.fire("✅ Usuario creado", "", "success");

      setForm({
        identidad: "",
        name: "",
        apellido: "",
        sexo: "",
        fecha: "",
        email: "",
        departamento: "",
        ciudad: "",
        telefono: "",
        tipo_envio: "",
        direccion: "",
        password: "",
        role: "cliente"
      });

    } catch (error) {
      Swal.fire("Error", "No se pudo crear usuario", "error");
    }
  };

  return (
    <div className="card shadow p-4">

      <h5 className="mb-3">Crear Usuario</h5>

      <form onSubmit={handleSubmit}>

        <div className="row g-2">

          <div className="col-md-4">
            <input
              name="identidad"
              placeholder="Identidad"
              className="form-control"
              value={form.identidad}
              onChange={handleChange}
            />
          </div>

          <div className="col-md-4">
            <input
              name="name"
              placeholder="Nombre"
              className="form-control"
              value={form.name}
              onChange={handleChange}
            />
          </div>

          <div className="col-md-4">
            <input
              name="apellido"
              placeholder="Apellido"
              className="form-control"
              value={form.apellido}
              onChange={handleChange}
            />
          </div>

          <div className="col-md-4">
            <select
              name="sexo"
              className="form-select"
              onChange={handleChange}
            >
              <option value="">Sexo</option>
              <option>Masculino</option>
              <option>Femenino</option>
            </select>
          </div>

          <div className="col-md-4">
            <input
              type="date"
              name="fecha"
              className="form-control"
              onChange={handleChange}
            />
          </div>

          <div className="col-md-4">
            <input
              name="email"
              placeholder="Correo"
              className="form-control"
              value={form.email}
              onChange={handleChange}
            />
          </div>

          <div className="col-md-4">
            <input
              name="departamento"
              placeholder="Departamento"
              className="form-control"
              onChange={handleChange}
            />
          </div>

          <div className="col-md-4">
            <input
              name="ciudad"
              placeholder="Ciudad"
              className="form-control"
              onChange={handleChange}
            />
          </div>

          <div className="col-md-4">
            <input
              name="telefono"
              placeholder="Teléfono"
              className="form-control"
              onChange={handleChange}
            />
          </div>

          <div className="col-md-6">
            <input
              name="tipo_envio"
              placeholder="Tipo de envío"
              className="form-control"
              onChange={handleChange}
            />
          </div>

          <div className="col-md-6">
            <input
              name="direccion"
              placeholder="Dirección"
              className="form-control"
              onChange={handleChange}
            />
          </div>

          <div className="col-md-6">
            <input
              type="password"
              name="password"
              placeholder="Contraseña"
              className="form-control"
              onChange={handleChange}
            />
          </div>

          <div className="col-md-6">
            <select
              name="role"
              className="form-select"
              value={form.role}
              onChange={handleChange}
            >
              <option value="cliente">Cliente</option>
              <option value="admin">Administrador</option>
            </select>
          </div>

        </div>

        <button className="btn btn-success w-100 mt-3">
          Guardar usuario
        </button>

      </form>

    </div>
  );
}