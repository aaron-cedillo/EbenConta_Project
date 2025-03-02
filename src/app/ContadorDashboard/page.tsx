"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { logoutUser, getUserName } from "@/app/services/authService";

export default function ContadorDashboard() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userName, setUserName] = useState<string | null>(null); // Estado para almacenar el nombre del usuario

  useEffect(() => {
    // Solo ejecutamos el acceso a localStorage en el cliente
    const storedUserName = getUserName();
    setUserName(storedUserName);
  }, []); // Este efecto solo se ejecuta una vez, después de que el componente se monte

  // Función para cerrar sesión
  const handleLogout = () => {
    logoutUser();
    router.push("/login");
  };

  if (!userName) {
    return <div>Cargando...</div>; // Mostrar un mensaje o spinner mientras se carga el nombre
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-2xl text-center">
        {/* Mensaje de bienvenida */}
        <h1 className="text-2xl font-semibold text-gray-800">Bienvenido, {userName}</h1>

        {/* Contenedor de botones */}
        <div className="mt-6 flex flex-col sm:flex-row flex-wrap gap-4 justify-center">
          <button
            onClick={() => router.push("/Clientes")}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition w-full sm:w-auto"
          >
            Clientes
          </button>
          <button
            onClick={() => router.push("/Ingresos-Egresos")}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition w-full sm:w-auto"
          >
            Ingresos y Egresos de clientes
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition w-full sm:w-auto"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>

      {/* Modal de confirmación */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-lg font-semibold">Confirmar cierre de sesión</h2>
            <p className="mt-2 text-gray-600">¿Estás seguro de que quieres cerrar sesión?</p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
