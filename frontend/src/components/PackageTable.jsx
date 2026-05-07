import { useEffect, useState, useContext } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { AuthContext } from "../context/AuthContext";
import PackageTimeline from "./PackageTimeline";

export default function PackageTable({ reload }) {

  const { user } = useContext(AuthContext);

  const [packages, setPackages] = useState([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // ✅ PAGINACIÓN BACKEND
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadPackages = async (page = 1) => {
    try {
      const token = localStorage.getItem("token");

      const params = new URLSearchParams({
        page,
        limit: 10,
        tracking: search,
        status: statusFilter,
        from: fromDate,
        to: toDate
      });

      const res = await axios.get(
        `http://localhost:3000/api/packages?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setPackages(res.data.data);
      setTotalPages(res.data.totalPages);
      setCurrentPage(res.data.page);

    } catch (error) {
      console.error(error);

      if (error.response?.status === 401) {
        Swal.fire("Sesión expirada", "Vuelve a iniciar sesión", "warning");
        localStorage.clear();
        window.location.href = "/login";
      }
    }
  };

  const deletePackage = async (id) => {
    const confirm = await Swal.fire({
      title: "¿Eliminar?",
      icon: "warning",
      showCancelButton: true
    });

    if (confirm.isConfirmed) {
      const token = localStorage.getItem("token");

      await axios.delete(
        `http://localhost:3000/api/packages/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      Swal.fire("Eliminado", "", "success");
      loadPackages(currentPage);
    }
  };

  const updateStatus = async (id, newStatus) => {

    const confirm = await Swal.fire({
      title: "¿Cambiar estado?",
      text: `Se cambiará a "${newStatus}"`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, actualizar",
      cancelButtonText: "Cancelar"
    });

    if (!confirm.isConfirmed) {
      loadPackages(currentPage);
      return;
    }

    try {
      const token = localStorage.getItem("token");

      await axios.put(
        `http://localhost:3000/api/packages/${id}/status`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      Swal.fire("Actualizado", "Estado cambiado correctamente", "success");
      loadPackages(currentPage);

    } catch (error) {
      Swal.fire("Error", "No se pudo actualizar", "error");
    }
  };

  // ✅ useEffect CORRECTO
  useEffect(() => {
    loadPackages(currentPage);
  }, [reload, currentPage]);

  return (
    <div className="card shadow">

      <div className="card-header">
        <h5 className="mb-2">Paquetes</h5>

        {/* ✅ FILTROS */}
        <div className="row g-2">

          <div className="col-md-2">
            <input
              type="text"
              placeholder="Tracking"
              className="form-control"
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="col-md-2">
            <select
              className="form-select"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">Estado</option>
              <option>En tránsito</option>
              <option>En bodega</option>
              <option>Entregado</option>
            </select>
          </div>

          <div className="col-md-2">
            <input
              type="date"
              className="form-control"
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>

          <div className="col-md-2">
            <input
              type="date"
              className="form-control"
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>

          <div className="col-md-2">
            <button
              className="btn btn-primary w-100"
              onClick={() => {
                setCurrentPage(1);   // ✅ reinicia página
                loadPackages(1);
              }}
            >
              🔍 Filtrar
            </button>
          </div>

          <div className="col-md-2">
  <button
    className="btn btn-success w-100"
    onClick={async () => {
      try {
        const token = localStorage.getItem("token");

        const params = new URLSearchParams({
          tracking: search,
          status: statusFilter,
          from: fromDate,
          to: toDate
        });

        const response = await axios.get(
          `http://localhost:3000/api/packages/export?${params.toString()}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            },
            responseType: "blob"
          }
        );

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");

        link.href = url;
        link.setAttribute("download", "paquetes.xlsx");

        document.body.appendChild(link);
        link.click();
        link.remove();

      } catch (error) {
        Swal.fire("Error", "No se pudo exportar", "error");
      }
    }}
  >
    📥 Exportar Excel
  </button>
</div>


        </div>

      </div>

      <div className="card-body table-responsive">

        <table className="table table-hover">
          <thead className="table-dark">
            <tr>
              <th>#</th>
              <th>Casillero</th>
              <th>Tracking</th>
              <th>Proveedor</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {packages.map((p, i) => (
              <tr key={p.id}>
                <td>{(currentPage - 1) * 10 + i + 1}</td>
                <td>{p.locker}</td>
                <td>{p.tracking}</td>
                <td>{p.provider}</td>

                <td>
                  <div className="mb-2">
                    <PackageTimeline status={p.status} />
                  </div>

                  {user?.role === "admin" && (
                    <select
                      className="form-select form-select-sm"
                      value={p.status}
                      onChange={(e) =>
                        updateStatus(p.id, e.target.value)
                      }
                    >
                      <option>En tránsito</option>
                      <option>En bodega</option>
                      <option>Entregado</option>
                    </select>
                  )}
                </td>

                <td>
                  {user?.role === "admin" && (
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => deletePackage(p.id)}
                    >
                      Eliminar
                    </button>
                  )}
                </td>

              </tr>
            ))}
          </tbody>

        </table>

        {/* ✅ PAGINACIÓN */}
        <div className="d-flex justify-content-center mt-3">

          <button
            className="btn btn-outline-primary me-2"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            ⬅ Anterior
          </button>

          <span className="align-self-center">
            Página {currentPage} de {totalPages}
          </span>

          <button
            className="btn btn-outline-primary ms-2"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Siguiente ➡
          </button>

        </div>

      </div>
    </div>
  );
}
