"use client"; 

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // <- Cambia esto
import { getUser, logoutUser } from "../services/authService";

// Definir la interfaz del usuario
interface Usuario {
  email: string;
  nombre?: string; // Otros campos opcionales
}

const Dashboard = () => {
  const [user, setUser] = useState<Usuario | null>(null);
  const router = useRouter(); // useRouter() ahora funciona correctamente

  useEffect(() => {
    const loggedInUser = getUser();
    if (!loggedInUser) {
      router.push("/login"); // Redirige si no hay usuario autenticado
    } else {
      setUser(loggedInUser);
    }
  }, [router]);

  const handleLogout = () => {
    logoutUser();
    router.push("/login");
  };

  return (
    <div className="p-6">
      {user ? (
        <>
          <h1 className="text-2xl font-bold">Bienvenido, {user.email}</h1>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 mt-4 rounded hover:bg-red-600 transition"
          >
            Cerrar sesión
          </button>
        </>
      ) : (
        <p>Cargando...</p>
      )}
    </div>
  );
};

export default Dashboard;
