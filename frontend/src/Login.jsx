

import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";

export default function App() {

  const { user, logout } = useContext(AuthContext);

  return (
    <div>
      <h1>Bienvenido {user?.name}</h1>

      
<button
  className="btn btn-danger btn-sm"
  onClick={handleLogout}
>
  Salir
</button>

    </div>
  );
}