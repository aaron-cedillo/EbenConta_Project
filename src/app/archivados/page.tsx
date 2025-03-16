"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { logoutUser, getUserName } from "@/app/services/authService";
import axios from "axios";
import { FaHome, FaUser, FaDollarSign, FaFolderOpen } from "react-icons/fa";

interface ClienteArchivado {
  ClienteID: number;
  Nombre: string;
  RFC: string;
  Correo: string;
  Telefono: string;
}

export default function Archivados() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [clientesArchivados, setClientesArchivados] = useState<ClienteArchivado[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [clienteAEliminar, setClienteAEliminar] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setUserName(getUserName());
    obtenerClientesArchivados();

    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsModalOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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
      setIsRestoring(true);

      await axios.put(`http://localhost:3001/api/clientes/restaurar/${clienteId}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("Cliente restaurado correctamente");

      setClientesArchivados((prevClientes) => prevClientes.filter((cliente) => cliente.ClienteID !== clienteId));
    } catch (error) {
      console.error("Error al restaurar cliente:", error);
      alert("Hubo un error al restaurar el cliente.");
    } finally {
      setIsRestoring(false);
    }
  };

  const handleEliminarCliente = async (clienteId: number) => {
    if (!clienteId) return;
  
    try {
      setIsDeleting(true);
      const token = localStorage.getItem("token");
  
      await axios.delete(`http://localhost:3001/api/clientes/${clienteId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      alert("Cliente eliminado permanentemente");
  
      setClientesArchivados((prevClientes) => prevClientes.filter((c) => c.ClienteID !== clienteId));
    } catch (error) {
      console.error("Error al eliminar cliente:", error);
      alert("Hubo un error al eliminar el cliente.");
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
      setClienteAEliminar(null); // 🔥 Asegura limpiar el estado después de eliminar
    }
  };  

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-[#14213D] text-white p-6 flex flex-col">
        <h1 className="text-2xl font-bold mb-6">
          eben<span className="text-[#FCA311]">Conta</span>
        </h1>

        {/* Botón Dashboard */}
        <button
          onClick={() => router.push("/ContadorDashboard")}
          className="flex items-center gap-2 text-white hover:bg-[#FCA311] px-4 py-3 rounded transition"
        >
          <FaHome />
          Dashboard
        </button>

        {/* Botón Clientes */}
        <button
          onClick={() => router.push("/Clientes")}
          className="flex items-center gap-2 text-white hover:bg-[#FCA311] px-4 py-3 rounded transition"
        >
          <FaUser />
          Clientes
        </button>

        {/* Botón Ingresos */}
        <button
          onClick={() => router.push("/Ingresos-Egresos")}
          className="flex items-center gap-2 text-white hover:bg-[#FCA311] px-4 py-3 rounded transition"
        >
          <FaDollarSign />
          Ingresos
        </button>

        {/* Botón Archivados */}
        <button
          onClick={() => router.push("/archivados")}
          className="flex items-center gap-2 text-white hover:bg-[#FCA311] px-4 py-3 rounded transition"
        >
          <FaFolderOpen />
          Archivados
        </button>
      </div>

      {/* Contenido Principal */}
      <div className="flex-1 p-8">
        {/* Encabezado */}
        <div className="flex justify-between items-center bg-white p-4 shadow rounded-lg">
          <h2 className="text-2xl font-bold text-[#14213D]">Clientes Archivados</h2>
          <div className="relative flex items-center gap-4">
            <p className="text-lg font-semibold text-[#14213D]">{userName}</p>
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setIsModalOpen(!isModalOpen)}
                className="w-10 h-10 flex items-center justify-center bg-gray-300 rounded-full"
              >
                <FaUser size={20} />
              </button>
              {isModalOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white shadow-md rounded-lg p-2">
                  <button
                    onClick={() => setShowLogoutModal(true)}
                    className="w-full px-4 py-2 text-left text-red-600 hover:bg-gray-200 rounded-lg"
                  >
                    Cerrar Sesión
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Lista de Clientes Archivados */}
        <div className="bg-white p-6 rounded-lg shadow-lg mt-6">
          {clientesArchivados.length === 0 ? (
            <p className="text-gray-500 text-center">No hay clientes archivados.</p>
          ) : (
            <ul className="divide-y divide-gray-300">
              {clientesArchivados.map((cliente) => (
                <li key={cliente.ClienteID} className="flex justify-between items-center py-4">
                  {/* Información del Cliente */}
                  <div className="text-[#14213D]">
                    <strong>{cliente.Nombre}</strong> - {cliente.RFC}
                    <p className="text-gray-500">{cliente.Correo} | {cliente.Telefono}</p>
                  </div>

                  {/* Botones de Restaurar y Eliminar */}
                  <div className="flex gap-2">
                    {/* Botón Restaurar */}
                    <button
                      onClick={() => handleRestaurarCliente(cliente.ClienteID)}
                      disabled={isRestoring}
                      className={`px-4 py-2 rounded-lg transition ${isRestoring
                        ? "bg-gray-400 text-white cursor-not-allowed"
                        : "bg-[#2D6A4F] text-white hover:bg-[#1B4332]"
                        }`}
                    >
                      {isRestoring ? "Restaurando..." : "Restaurar"}
                    </button>

                    {/* Botón Eliminar */}
                    <button
                      onClick={() => {
                        setClienteAEliminar(cliente.ClienteID);
                        setShowDeleteModal(true);
                      }}
                      className="px-4 py-2 bg-[#D62828] text-white rounded-lg hover:bg-[#A12020] transition"
                    >
                      Eliminar
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Modal de Confirmación de Eliminación */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg shadow-md w-96 border-2 border-[#FCA311]">
              <h3 className="text-xl font-semibold text-[#14213D] mb-4">Confirmar Eliminación</h3>
              <p className="text-[#14213D]">¿Estás seguro de eliminar este cliente? Esta acción no se puede deshacer.</p>
              <div className="flex justify-between mt-6">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="bg-[#6C757D] text-white px-4 py-2 rounded hover:bg-[#545B62] transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => clienteAEliminar && handleEliminarCliente(clienteAEliminar)}  
                  disabled={isDeleting}
                  className={`px-4 py-2 rounded transition ${isDeleting ? "bg-gray-400 cursor-not-allowed" : "bg-[#D62828] text-white hover:bg-[#A12020]"
                    }`}
                >
                  {isDeleting ? "Eliminando..." : "Eliminar"}
                </button>

              </div>
            </div>
          </div>
        )}

        {/* Modal de confirmación de cierre de sesión */}
        {showLogoutModal && (
          <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-md w-96">
              <h3 className="text-lg font-semibold text-[#14213D]">¿Seguro que quieres cerrar sesión?</h3>
              <div className="mt-4 flex justify-end gap-4">
                <button onClick={() => setShowLogoutModal(false)} className="px-4 py-2 bg-gray-400 text-white rounded">
                  Cancelar
                </button>
                <button onClick={handleLogout} className="px-4 py-2 bg-red-500 text-white rounded">
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
