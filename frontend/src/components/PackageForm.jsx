import { useState, useContext, useEffect } from "react";
import Swal from "sweetalert2";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

export default function PackageForm({ onSuccess }) {

  const { user } = useContext(AuthContext);

  const [form, setForm] = useState({
    tracking: "",
    provider: ""
  });

  // ✅ CARGAR LOCKER AUTOMÁTICO CUANDO ABRE
  useEffect(() => {
    if (user?.locker) {
      setForm((prev) => ({
        ...prev,
        locker: user.locker
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.tracking || !form.provider) {
      return Swal.fire("Error", "Completa todos los campos", "error");
    }

    try {
      // ✅ guardar paquete
    const token = localStorage.getItem("token");

await axios.post(
  "http://localhost:3000/api/packages",
  form,
  {
    headers: {
      Authorization: `Bearer ${token}`
    }
  }
);


      // ✅ alerta éxito
      await Swal.fire("Éxito", "Paquete guardado correctamente", "success");

      // ✅ limpiar formulario (pero mantener locker)
      setForm({
        locker: user?.locker || "",
        tracking: "",
        provider: ""
      });

      // ✅ actualizar tabla automáticamente
      if (onSuccess) {
        onSuccess();
      }

      // ✅ cerrar modal automáticamente
      const closeBtn = document.querySelector('#modalPackage .btn-close');
      if (closeBtn) closeBtn.click();

    } catch (error) {
      Swal.fire("Error", "No se pudo guardar", "error");
    }
  };

  return (
    <div className="card shadow h-100">

      <div className="card-header bg-primary text-white">
        <h5 className="mb-0">Registro de Paquete</h5>
      </div>

      <div className="card-body">

        <form onSubmit={handleSubmit}>


          {/* Tracking */}
          <div className="mb-3">
            <label className="form-label">Número de guía</label>
            <input
              type="text"
              name="tracking"
              className="form-control"
              placeholder="ABC123456"
              value={form.tracking}
              onChange={handleChange}
            />
          </div>

          {/* Proveedor */}
          <div className="mb-3">
            <label className="form-label">Proveedor</label>
            <select
              name="provider"
              className="form-select"
              value={form.provider}
              onChange={handleChange}
            >
              <option value="">Seleccionar</option>
              <option>Amazon</option>
              <option>eBay</option>
              <option>Shein</option>
              <option>Temu</option>
              <option>AliExpress</option>
            </select>
          </div>

          {/* Fecha */}
          <div className="mb-3">
            <label className="form-label">Fecha de registro</label>
            <input
              type="text"
              className="form-control"
              value={new Date().toLocaleDateString()}
              disabled
            />
          </div>

          {/* Botón */}
          <button className="btn btn-primary w-100">
            Guardar Paquete
          </button>

        </form>

      </div>
    </div>
  );
}