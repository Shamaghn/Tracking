import { useEffect, useState } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";

export default function Dashboard() {

  const [metrics, setMetrics] = useState({
    total: 0,
    en_transito: 0,
    en_bodega: 0,
    entregado: 0
  });

  const [transito, setTransito] = useState([]);
  const [bodega, setBodega] = useState([]);
  const [atrasados, setAtrasados] = useState([]);
  const [totalUsuarios, setTotalUsuarios] = useState(0);
  const [ultimoUsuario, setUltimoUsuario] = useState(null);

  const loadMetrics = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        "http://localhost:3000/api/packages/metrics",
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setMetrics(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const loadDashboardData = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        "http://localhost:3000/api/auth/dashboard-data",
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      console.log("DASHBOARD DATA:", res.data); // ✅ DEBUG

      setTransito(res.data.transito || []);
      setBodega(res.data.bodega || []);
      setAtrasados(res.data.atrasados || []);
      setTotalUsuarios(res.data.totalUsuarios || 0);
      setUltimoUsuario(res.data.ultimoUsuario || null);

    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadMetrics();
    loadDashboardData();
  }, []);

  const data = {
    labels: ["En tránsito", "En bodega", "Entregado"],
    datasets: [
      {
        label: "Paquetes",
        data: [
          metrics.en_transito,
          metrics.en_bodega,
          metrics.entregado
        ],
        backgroundColor: [
          "#ffc107",
          "#0d6efd",
          "#198754"
        ]
      }
    ]
  };

  return (
    <div className="container mt-4">

      <h3 className="mb-3">📊 Dashboard</h3>

      {/* 🚨 ALERTA */}
      {atrasados.length > 0 && (
        <div className="alert alert-danger">
          🚨 Hay {atrasados.length} paquetes atrasados
        </div>
      )}

      {/* TARJETAS */}
      <div className="row text-center mb-4">

        <div className="col-md-3">
          <div className="card shadow p-3">
            <h6>Total</h6>
            <h3>{metrics.total}</h3>
          </div>
        </div>

        <div className="col-md-3">
          <div className={`card shadow p-3 ${
            metrics.en_transito > 5 ? "border-warning" : ""
          }`}>
            <h6>🚚 En tránsito</h6>
            <h3 className={metrics.en_transito > 5 ? "text-warning" : ""}>
              {metrics.en_transito}
            </h3>
          </div>
        </div>

        <div className="col-md-3">
          <div className={`card shadow p-3 ${
            metrics.en_bodega > 5 ? "border-primary" : ""
          }`}>
            <h6>📦 En bodega</h6>
            <h3 className={metrics.en_bodega > 5 ? "text-primary" : ""}>
              {metrics.en_bodega}
            </h3>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card shadow p-3 border-success">
            <h6>✅ Entregado</h6>
            <h3 className="text-success">
              {metrics.entregado}
            </h3>
          </div>
        </div>

      </div>

      {/* USUARIOS */}
      <div className="row mb-4">

        <div className="col-md-6">
          <div className="card shadow p-3">
            <h6>👥 Usuarios registrados</h6>
            <h3>{totalUsuarios}</h3>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card shadow p-3">
            <h6>🆕 Último usuario</h6>

            {ultimoUsuario ? (
              <>
                <p className="mb-1">{ultimoUsuario.name}</p>
                <small>{ultimoUsuario.email}</small>
              </>
            ) : (
              <p>Sin registros</p>
            )}

          </div>
        </div>

      </div>

      {/* GRÁFICA */}
      <div className="card shadow p-4 mb-4">
        <Bar data={data} />
      </div>

      {/* LISTAS */}
      <div className="row">

        <div className="col-md-6">
          <div className="card shadow p-3">
            <h6>🚚 Paquetes en tránsito</h6>

            <ul className="list-group mt-2">
              {transito.length === 0 ? (
                <li className="list-group-item text-center">
                  No hay paquetes
                </li>
              ) : (
                transito.map(p => {
                  const isLate = atrasados.some(a => a.id === p.id);

                  return (
                    <li
                      key={p.id}
                      className={`list-group-item ${
                        isLate ? "list-group-item-danger" : ""
                      }`}
                    >
                      {p.tracking || "Paquete"} {isLate && "🚨"}
                    </li>
                  );
                })
              )}
            </ul>

          </div>
        </div>

        <div className="col-md-6">
          <div className="card shadow p-3">
            <h6>📦 Paquetes en bodega</h6>

            <ul className="list-group mt-2">
              {bodega.length === 0 ? (
                <li className="list-group-item text-center">
                  No hay paquetes
                </li>
              ) : (
                bodega.map(p => (
                  <li key={p.id} className="list-group-item">
                    {p.tracking || "Paquete"}
                  </li>
                ))
              )}
            </ul>

          </div>
        </div>

      </div>

    </div>
  );
}
