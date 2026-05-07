import { useEffect, useState } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";

// ✅ CONFIGURACIÓN CHART.JS (IMPORTANTE 🔥)
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
);

export default function Dashboard() {

  const [metrics, setMetrics] = useState({
    total: 0,
    en_transito: 0,
    en_bodega: 0,
    entregado: 0
  });

  const loadMetrics = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        "http://localhost:3000/api/packages/metrics",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setMetrics(res.data);

    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadMetrics();
  }, []);

  // ✅ CONFIGURACIÓN GRÁFICA
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

      <h3 className="mb-4">📊 Dashboard</h3>

      {/* ✅ TARJETAS */}
      <div className="row text-center mb-4">

        <div className="col-md-3 mb-3">
          <div className="card p-3 shadow">
            <h6>Total paquetes</h6>
            <h3>{metrics.total}</h3>
          </div>
        </div>

        <div className="col-md-3 mb-3">
          <div className="card p-3 shadow border-warning">
            <h6>En tránsito</h6>
            <h3 className="text-warning">{metrics.en_transito}</h3>
          </div>
        </div>

        <div className="col-md-3 mb-3">
          <div className="card p-3 shadow border-primary">
            <h6>En bodega</h6>
            <h3 className="text-primary">{metrics.en_bodega}</h3>
          </div>
        </div>

        <div className="col-md-3 mb-3">
          <div className="card p-3 shadow border-success">
            <h6>Entregados</h6>
            <h3 className="text-success">{metrics.entregado}</h3>
          </div>
        </div>

      </div>

      {/* ✅ GRÁFICA */}
      <div className="card p-4 shadow">
        <h5 className="mb-3">Distribución de paquetes</h5>
        <Bar data={data} />
      </div>

    </div>
  );
}