import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

export default function UserTable() {

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");

  // ✅ FILTRO
  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(search.toLowerCase())
  );

  // ✅ CARGAR USUARIOS
  const loadUsers = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        "http://localhost:3000/api/auth/users",
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setUsers(res.data);

    } catch (error) {
      console.error("ERROR LOAD USERS:", error);
      Swal.fire("Error", "No se pudieron cargar los usuarios", "error");
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // ✅ ELIMINAR
  const handleDelete = async (id) => {

    const confirm = await Swal.fire({
      title: "¿Eliminar usuario?",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar"
    });

    if (!confirm.isConfirmed) return;

    try {
      const token = localStorage.getItem("token");

      await axios.delete(
        `http://localhost:3000/api/auth/users/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      Swal.fire("✅ Eliminado", "Usuario eliminado", "success");

      loadUsers();

    } catch (error) {
      console.error(error);
      Swal.fire("Error", "No se pudo eliminar", "error");
    }
  };

  // ✅ CAMBIAR ROL CON CONFIRMACIÓN
  const changeRole = async (id, role) => {

    const confirm = await Swal.fire({
      title: "¿Cambiar rol?",
      text: `Nuevo rol: ${role}`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, cambiar"
    });

    if (!confirm.isConfirmed) {
      loadUsers(); // 🔥 vuelve al valor original si cancela
      return;
    }

    try {
      const token = localStorage.getItem("token");

      await axios.put(
        `http://localhost:3000/api/auth/users/${id}/role`,
        { role },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      Swal.fire("✅ Rol actualizado", "", "success");

      loadUsers();

    } catch (error) {
      console.error(error);
      Swal.fire("Error", "No se pudo actualizar", "error");
    }
  };

  return (
    <div className="card shadow p-4 mt-3">

      <h5 className="mb-3">Usuarios</h5>

      {/* ✅ BUSCADOR */}
      <input
        type="text"
        placeholder="🔍 Buscar por nombre..."
        className="form-control mb-3"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* ✅ TABLA */}
      <table className="table table-hover table-bordered">

        <thead className="table-light">
          <tr>
            <th>Nombre</th>
            <th>Email</th>
            <th style={{ width: "200px" }}>Rol</th>
            <th style={{ width: "120px" }}>Acciones</th>
          </tr>
        </thead>

        <tbody>
          {filteredUsers.length === 0 ? (
            <tr>
              <td colSpan="4" className="text-center">
                No hay resultados
              </td>
            </tr>
          ) : (
            filteredUsers.map(user => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.email}</td>

                <td>
                  <select
                    value={user.role}
                    onChange={(e) =>
                      changeRole(user.id, e.target.value)
                    }
                    className="form-select"
                  >
                    <option value="cliente">Cliente</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>

                <td>
                  <button
                    className="btn btn-danger btn-sm w-100"
                    onClick={() => handleDelete(user.id)}
                  >
                    Eliminar
                  </button>
                </td>

              </tr>
            ))
          )}
        </tbody>

      </table>

    </div>
  );
}