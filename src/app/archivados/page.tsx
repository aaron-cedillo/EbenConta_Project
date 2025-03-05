"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { logoutUser, getUserName } from "@/app/services/authService";
import axios from "axios";

interface ClienteArchivado {
  ClienteID: number;
  Nombre: string;
  RFC: string;
  Correo: string;
  Telefono: string;
  Direccion: string;
}

export default function Archivados() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [clientesArchivados, setClientesArchivados] = useState<ClienteArchivado[]>([]);
  const [isRestoring, setIsRestoring] = useState(false); // Estado para mostrar el proceso de restauración

  useEffect(() => {
    const storedUserName = getUserName();
    setUserName(storedUserName);
    obtenerClientesArchivados();
  }, []);

  const handleLogout = () => {
    logoutUser();
    router.push("/login");
  };

  const obtenerClientesArchivados = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:3001/api/clientes/archivados", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClientesArchivados(response.data);
    } catch (error) {
      console.error("Error al obtener clientes archivados:", error);
    }
  };

  const handleRestaurarCliente = async (clienteId: number) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("Usuario no autenticado");
        return;
      }

      setIsRestoring(true); // Mostrar proceso de restauración

      await axios.put(`http://localhost:3001/api/clientes/restaurar/${clienteId}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("Cliente restaurado correctamente");

      // Actualizar la lista de clientes archivados automáticamente
      setClientesArchivados((prevClientes) => prevClientes.filter((cliente) => cliente.ClienteID !== clienteId));
    } catch (error) {
      console.error("Error al restaurar cliente:", error);
      alert("Hubo un error al restaurar el cliente.");
    } finally {
      setIsRestoring(false); // Ocultar proceso de restauración
    }
  };

  if (!userName) {
    return <div className="flex items-center justify-center min-h-screen text-xl">Cargando...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 p-6">
      {/* Encabezado */}
      <div className="flex justify-between items-center px-8 py-4 bg-white shadow-md">
        <h1 className="text-2xl font-semibold text-gray-800">Bienvenido, {userName}</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
        >
          Cerrar Sesión
        </button>
      </div>

      {/* Botón de navegación */}
      <div className="flex justify-center mt-6">
        <button
          onClick={() => router.push("/ContadorDashboard")}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Volver al Dashboard
        </button>
      </div>

      {/* Lista de clientes archivados */}
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl mt-6 mx-auto">
        <h2 className="text-xl font-semibold mb-4">Clientes Archivados</h2>
        {clientesArchivados.length === 0 ? (
          <p className="text-gray-500">No hay clientes archivados.</p>
        ) : (
          <ul className="divide-y divide-gray-300">
            {clientesArchivados.map((cliente) => (
              <li key={cliente.ClienteID} className="flex justify-between items-center py-4">
                <div>
                  <strong>{cliente.Nombre}</strong> - {cliente.RFC}
                  <p className="text-gray-500">{cliente.Correo} | {cliente.Telefono}</p>
                </div>
                <button
                  onClick={() => handleRestaurarCliente(cliente.ClienteID)}
                  disabled={isRestoring} // Deshabilitar botón mientras se restaura
                  className={`px-4 py-2 rounded-lg transition ${isRestoring ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 text-white hover:bg-green-700"}`}
                >
                  {isRestoring ? "Restaurando..." : "Restaurar"}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Modal de confirmación de cierre de sesión */}
      {isModalOpen && (
        <div className="fixed inset-0 flex justify-center items-center bg-gray-900 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-lg font-semibold">¿Seguro que quieres cerrar sesión?</h3>
            <div className="mt-4 flex justify-end gap-4">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-gray-500 text-white rounded-lg">Cancelar</button>
              <button onClick={handleLogout} className="px-4 py-2 bg-red-600 text-white rounded-lg">Confirmar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
