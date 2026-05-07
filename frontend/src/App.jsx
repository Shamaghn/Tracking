import { useState, useContext } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";

import PackageForm from "./components/PackageForm";
import PackageTable from "./components/PackageTable";
import { AuthContext } from "./context/AuthContext";
import Swal from "sweetalert2";
import Login from "./pages/Login";
import PrivateRoute from "./components/PrivateRoute";
import { Modal } from "bootstrap";
import Tracking from "./pages/Tracking";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import CreateUser from "./pages/CreateUser";
import UserTable from "./pages/UserTable";
import Profile from "./pages/Profile";

export default function App() {

  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [view, setView] = useState("packages");
  const [collapsed, setCollapsed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false); // ✅ CONTROL MENÚ

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "¿Cerrar sesión?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí"
    });

    if (result.isConfirmed) {
      logout();
      navigate("/login");
    }
  };

  const openModal = () => {
    const modal = new Modal(document.getElementById("modalPackage"));
    modal.show();
  };

  return (
    <Routes>

      <Route path="/login" element={<Login />} />
      <Route path="/tracking" element={<Tracking />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/"
        element={
          <PrivateRoute>

            <div className="d-flex">

              {/* SIDEBAR */}
              <nav
                className="bg-dark text-white p-3 d-flex flex-column"
                style={{
                  width: collapsed ? "80px" : "250px",
                  height: "100vh",
                  transition: "0.3s"
                }}
              >

                <button
                  className="btn btn-outline-light mb-3"
                  onClick={() => setCollapsed(!collapsed)}
                >
                  ☰
                </button>

                {!collapsed && (
                  <h5 className="mb-4 text-center">Tracking</h5>
                )}

                <div className="d-flex flex-column gap-2">

                  {user?.role === "admin" && (
                    <button
                      onClick={() => setView("dashboard")}
                      className={`btn ${
                        view === "dashboard"
                          ? "btn-light"
                          : "btn-outline-light"
                      }`}
                    >
                      📊 {!collapsed && "Dashboard"}
                    </button>
                  )}

                  <button
                    onClick={() => setView("packages")}
                    className={`btn ${
                      view === "packages"
                        ? "btn-light"
                        : "btn-outline-light"
                    }`}
                  >
                    📦 {!collapsed && "Paquetes"}
                  </button>

                  {user?.role === "admin" && (
                    <button
                      onClick={() => setView("users")}
                      className={`btn ${
                        view === "users"
                          ? "btn-light"
                          : "btn-outline-light"
                      }`}
                    >
                      👤 {!collapsed && "Usuarios"}
                    </button>
                  )}

                  <button
                    className="btn btn-success mt-3"
                    onClick={openModal}
                  >
                    ➕ {!collapsed && "Registrar"}
                  </button>
                </div>

                <div className="mt-auto pt-3 border-top">
                  <button
                    className="btn btn-danger w-100"
                    onClick={handleLogout}
                  >
                    🔒 {!collapsed && "Salir"}
                  </button>
                </div>

              </nav>

              {/* CONTENIDO */}
              <div className="flex-grow-1 bg-light">

                {/* TOPBAR */}
                <nav className="navbar bg-white shadow px-4 d-flex justify-content-between">

                  <span className="fw-bold">Panel Administrativo</span>

                  {/* ✅ USUARIO CON MENU PROPIO */}
                  <div style={{ position: "relative" }}>

                    <div
                      onClick={() => setMenuOpen(!menuOpen)}
                      className="d-flex align-items-center gap-2"
                      style={{ cursor: "pointer" }}
                    >

                      {/* AVATAR */}
                      <div
                        style={{
                          width: "38px",
                          height: "38px",
                          borderRadius: "50%",
                          background: "linear-gradient(135deg, #0d6efd, #6610f2)",
                          color: "white",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: "bold"
                        }}
                      >
                        {user?.name?.charAt(0).toUpperCase()}
                      </div>

                      <strong>{user?.name} ▼</strong>

                    </div>

                    {/* ✅ MENU DESPLEGABLE REAL */}
                    {menuOpen && (
                      <div
                        style={{
                          position: "absolute",
                          right: 0,
                          top: "50px",
                          background: "#fff",
                          borderRadius: "8px",
                          boxShadow: "0px 4px 12px rgba(0,0,0,0.2)",
                          width: "200px",
                          zIndex: 1000
                        }}
                      >

                        <div className="p-3 text-center">
                          <strong>{user?.name}</strong><br />
                          <small className="text-muted">{user?.role}</small>
                        </div>

                        <hr className="m-0" />
<button
  className="dropdown-item"
  onClick={() => {
    setView("profile");
    setMenuOpen(false);
  }}
>
  👤 Ver perfil
</button>

                        <button className="dropdown-item">
                          ⚙ Configuración
                        </button>

                        <hr className="m-0" />

                        <button
                          className="dropdown-item text-danger"
                          onClick={handleLogout}
                        >
                          🔴 Cerrar sesión
                        </button>

                      </div>
                    )}

                  </div>

                </nav>

                {/* CONTENIDO */}
                <div className="p-4">

                  {view === "dashboard" && user?.role === "admin" && (
                    <Dashboard />
                  )}

                  {view === "packages" && <PackageTable />}

                  {view === "users" && user?.role === "admin" && (
                    <>
                      <CreateUser />
                      <UserTable />
                    </>
                  )}
                  
{view === "profile" && (
  <Profile />
)}


                </div>

              </div>

            </div>

            {/* MODAL */}
            <div className="modal fade" id="modalPackage">
              <div className="modal-dialog">
                <div className="modal-content">

                  <div className="modal-header">
                    <h5>Registrar paquete</h5>
                    <button className="btn-close" data-bs-dismiss="modal"></button>
                  </div>

                  <div className="modal-body">
                    <PackageForm />
                  </div>

                </div>
              </div>
            </div>

          </PrivateRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" />} />

    </Routes>
  );
}
``