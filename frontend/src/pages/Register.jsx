import { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

export default function Register() {

  const navigate = useNavigate();

const [form, setForm] = useState({
  identidad: "",
  name: "",             // ✅ IMPORTANTE
  apellido: "",
  sexo: "",
  fecha_nacimiento: "", // ✅ IMPORTANTE
  email: "",
  departamento: "",
  ciudad: "",
  telefono: "",
  tipo_envio: "",       // ✅ IMPORTANTE
  direccion: "",
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
        console.log("DATOS ENVIADOS:", form);
     const res = await axios.post(
  "http://localhost:3000/api/auth/register",
  form
);

// ✅ MOSTRAR LOCKER
await Swal.fire({
  title: "✅ Registro exitoso",
  html: `
    <p>Usuario creado correctamente</p>
    <h5 style="color:green;">📦 ${res.data.locker}</h5>
    <small>Guarda este número para rastrear tus paquetes</small>
  `,
  icon: "success",
  confirmButtonText: "Ir al login"
});

// ✅ REDIRIGIR
navigate("/login");

    } 
catch (error) {

  if (error.response?.data?.msg) {
    Swal.fire("Error", error.response.data.msg, "error");
  } else {
    Swal.fire("Error", "No se pudo registrar", "error");
  }

}

  };

  return (
    <div className="container mt-4">

      <h3 className="mb-4">Agregar nuevo usuario</h3>

      <form onSubmit={handleSubmit} className="card p-4 shadow">

        <div className="row">

          <div className="col-md-4 mb-3">
            <input name="identidad" onChange={handleChange} className="form-control" placeholder="Identidad" />
          </div>

          <div className="col-md-4 mb-3">
            
<input
  type="text"
  name="name"
  className="form-control"
  placeholder="Nombre"
  onChange={handleChange}
/>

          </div>

          <div className="col-md-4 mb-3">
            <input name="apellido" onChange={handleChange} className="form-control" placeholder="Apellido" />
          </div>

          <div className="col-md-4 mb-3">
            <select name="sexo" onChange={handleChange} className="form-select">
              <option>Sexo</option>
              <option>Masculino</option>
              <option>Femenino</option>
            </select>
          </div>

          <div className="col-md-4 mb-3">
            <input type="date" name="fecha_nacimiento" onChange={handleChange} className="form-control" />
          </div>

          <div className="col-md-4 mb-3">
            <input name="email" onChange={handleChange} className="form-control" placeholder="Correo" />
          </div>

          <div className="col-md-4 mb-3">
            <input name="departamento" onChange={handleChange} className="form-control" placeholder="Departamento" />
          </div>

          <div className="col-md-4 mb-3">
            <input name="ciudad" onChange={handleChange} className="form-control" placeholder="Ciudad" />
          </div>

          <div className="col-md-4 mb-3">
            <input name="telefono" onChange={handleChange} className="form-control" placeholder="Teléfono" />
          </div>

          <div className="col-md-6 mb-3">
            <input name="tipo_envio" onChange={handleChange} className="form-control" placeholder="Tipo de envío" />
          </div>

          <div className="col-md-6 mb-3">
            <input name="direccion" onChange={handleChange} className="form-control" placeholder="Dirección" />
          </div>

          <div className="col-md-12 mb-3">
            <input type="password" name="password" onChange={handleChange} className="form-control" placeholder="Contraseña" />
          </div>

        </div>

        <button className="btn btn-success">
          Guardar usuario
        </button>

      </form>

    </div>
  );
}
