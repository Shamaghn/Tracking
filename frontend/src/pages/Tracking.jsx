import { useState, useEffect } from "react";
import axios from "axios";
import PackageTimeline from "../components/PackageTimeline";

export default function Tracking() {

  const [tracking, setTracking] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false); // ✅ nuevo

  useEffect(() => {

    if (!tracking.trim()) {
      setResults([]);
      return;
    }

    const delay = setTimeout(async () => {

      setLoading(true); // ✅ ACTIVA LOADING

      try {
        const res = await axios.get(
          `http://localhost:3000/api/packages/track/${tracking.trim()}`
        );

        setResults(Array.isArray(res.data) ? res.data : [res.data]);

      } catch {
        setResults([]);
      }

      setLoading(false); // ✅ APAGA LOADING

    }, 600);

    return () => clearTimeout(delay);

  }, [tracking]);

  return (
    <div className="container mt-5">

      <h3 className="text-center mb-4">
        📦 Seguimiento de paquetes
      </h3>

      {/* INPUT */}
      <div className="d-flex justify-content-center mb-4">
        <input
          type="text"
          className="form-control w-50"
          placeholder="Buscar tracking o casillero"
          onChange={(e) => setTracking(e.target.value)}
        />
      </div>

      <div className="row">

        {/* ✅ LOADING SKELETON */}
        {loading &&
          [1, 2].map((i) => (
            <div className="col-md-6 mb-3" key={i}>
              <div className="card p-3 shadow skeleton-card">

                <div className="skeleton-text mb-2"></div>
                <div className="skeleton-text small"></div>
                <div className="skeleton-text small"></div>
                <div className="skeleton-bar mt-3"></div>

              </div>
            </div>
          ))
        }

        {/* ✅ RESULTADOS */}
        {!loading && results.map((pkg, index) => (
          <div className="col-md-6 mb-3" key={index}>

            <div className="card shadow p-3 h-100">

              <h6 className="text-primary">
                📦 {pkg.tracking}
              </h6>

              <p><strong>Proveedor:</strong> {pkg.provider}</p>
              <p><strong>Casillero:</strong> {pkg.locker}</p>

              <PackageTimeline status={pkg.status} />

            </div>

          </div>
        ))}

      </div>

      {/* SIN RESULTADOS */}
      {!loading && results.length === 0 && tracking.trim() && (
        <div className="text-center text-danger mt-3">
          No se encontraron paquetes
        </div>
      )}

    </div>
  );
}
