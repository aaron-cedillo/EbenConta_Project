"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { logoutUser, getUserName } from "../services/authService";
import axios from "axios";
import { FaHome, FaUser, FaDollarSign, FaFolderOpen, FaEye } from "react-icons/fa";

interface Cliente {
  ClienteID: number;
  Nombre: string;
  RFC: string;
  Correo: string;
  Telefono: string;
  Direccion: string;
}

export default function IngresosEgresos() {
  const router = useRouter();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [filteredClientes, setFilteredClientes] = useState<Cliente[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [userName, setUserName] = useState<string | null>(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchClientes();
    const storedUserName = getUserName();
    if (storedUserName) setUserName(storedUserName);

    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsModalOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredClientes(clientes);
    } else {
      setFilteredClientes(
        clientes.filter(
          (cliente) =>
            cliente.Nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            cliente.RFC.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
  }, [searchTerm, clientes]);

  const fetchClientes = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("Usuario no autenticado");
        return;
      }

      const response = await axios.get("http://localhost:3001/api/clientes", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setClientes(response.data);
      setFilteredClientes(response.data);
    } catch (error) {
      console.error("Error al obtener clientes:", error);
    }
  };

  const handleLogout = () => {
    logoutUser();
    router.push("/login");
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

      {/* Contenido */}
      <div className="flex-1 p-8">
        {/* Encabezado */}
        <div className="flex justify-between items-center bg-white p-4 shadow rounded-lg">
          <h2 className="text-2xl font-bold text-[#14213D]">Clientes</h2>
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

        {/* Barra de búsqueda */}
        <div className="mt-6 flex justify-center">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar cliente..."
            className="w-full max-w-7xl p-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#FCA311] text-[#14213D] shadow-md text-lg"
          />
        </div>

        {/* Lista de Clientes */}
        <div className="mt-6 w-full flex justify-center">
          <div className="w-full max-w-7xl bg-white p-6 rounded-lg shadow">
            {filteredClientes.length === 0 ? (
              <p className="text-gray-300 text-center text-lg">No se encontraron clientes.</p>
            ) : (
              filteredClientes.map((cliente) => (
                <div key={cliente.ClienteID} className="flex justify-between items-center border-b py-4">
                  {/* Información del Cliente */}
                  <div className="text-[#14213D]">
                    <h3 className="text-lg font-bold">{cliente.Nombre}</h3>
                    <p className="text-gray-500">{cliente.RFC}</p>
                  </div>

                  {/* Botones de Acción */}
                  <div className="flex gap-2">
                    {/* Ver Cliente */}
                    <button
                      onClick={() => router.push(`/ClienteDashboard/${cliente.ClienteID}`)}
                      className="p-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition"
                    >
                      <FaEye />
                    </button>

                    {/* Ingresos-Egresos */}
                    <button
                      onClick={() => router.push(`/IE/${cliente.ClienteID}`)}
                      className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                    >
                      <FaDollarSign />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>


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
