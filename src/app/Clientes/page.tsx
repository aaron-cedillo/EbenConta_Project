"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { logoutUser, getUserName } from "../services/authService";
import axios from "axios";
import { FaHome, FaUser, FaDollarSign, FaFolderOpen, FaEdit, FaEye, FaTrash } from "react-icons/fa";

interface Cliente {
  ClienteID: number;
  Nombre: string;
  RFC: string;
  Correo: string;
  Telefono: string;
  Direccion: string;
}

export default function Clientes() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [nombre, setNombre] = useState("");
  const [rfc, setRfc] = useState("");
  const [correo, setCorreo] = useState("");
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [userName, setUserName] = useState("");
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const userMenuRef = useRef<HTMLDivElement>(null);

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

  const fetchClientes = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:3001/api/clientes", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClientes(response.data);
    } catch (error) {
      console.error("Error al obtener clientes:", error);
    }
  };

  const handleLogout = () => {
    logoutUser();
    router.push("/login");
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:3001/api/clientes",
        { nombre, rfc, correo, telefono, direccion },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      resetForm();
      fetchClientes();
    } catch (error) {
      console.error("Error al registrar cliente:", error);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedId === null) return;
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:3001/api/clientes/${selectedId}`,
        { nombre, rfc, correo, telefono, direccion },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      resetForm();
      fetchClientes();
    } catch (error) {
      console.error("Error al actualizar cliente:", error);
    }
  };

  const handleEditClient = (cliente: Cliente) => {
    setNombre(cliente.Nombre);
    setRfc(cliente.RFC);
    setCorreo(cliente.Correo);
    setTelefono(cliente.Telefono);
    setDireccion(cliente.Direccion);
    setSelectedId(cliente.ClienteID);
    setEditMode(true);
  };

  const handleClienteArchive = (cliente: Cliente) => {
    setSelectedCliente(cliente);
    setShowDeleteModal(true);
  };

  const confirmarEliminacion = () => {
    if (selectedCliente) {
      handleArchiveCliente(selectedCliente.ClienteID);
    }
    setShowDeleteModal(false);
  };

  const cancelarEliminacion = () => {
    setShowDeleteModal(false);
  };

  const handleArchiveCliente = async (clienteId: number) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("Usuario no autenticado");
        return;
      }

      await axios.put(`http://localhost:3001/api/clientes/archivar/${clienteId}`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      alert("Cliente archivado correctamente");

      // Filtrar los clientes para que desaparezcan de la lista actual
      setClientes(clientes.filter((cliente) => cliente.ClienteID !== clienteId));

    } catch (error) {
      console.error("Error al archivar cliente:", error);
      alert("Hubo un error al archivar el cliente.");
    }
  };

  const resetForm = () => {
    setNombre("");
    setRfc("");
    setCorreo("");
    setTelefono("");
    setDireccion("");
    setEditMode(false);
    setSelectedId(null);
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

        {/* Contenido de Clientes */}
        <div className="grid grid-cols-3 gap-6 mt-6">
          {/* Lista de Clientes */}
          <div className="col-span-2 bg-white p-6 rounded-lg shadow">
            {clientes.map((cliente) => (
              <div key={cliente.ClienteID} className="flex justify-between items-center border-b py-4">
                {/* Información del Cliente */}
                <div>
                  <h3 className="text-lg font-bold text-[#14213D]">{cliente.Nombre}</h3>
                  <p className="text-gray-500">{cliente.RFC}</p>
                </div>

                {/* Botones de Acción */}
                <div className="flex gap-2">
                  {/* Editar Cliente */}
                  <button onClick={() => handleEditClient(cliente)} className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                    <FaEdit />
                  </button>

                  {/* Ver Cliente */}
                  <button onClick={() => router.push(`/ClienteDashboard/${cliente.ClienteID}`)} className="p-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition">
                    <FaEye />
                  </button>

                  {/* Ingresos-Egresos */}
                  <button onClick={() => router.push(`/IE/${cliente.ClienteID}`)} className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition">
                    <FaDollarSign />
                  </button>

                  {/* Eliminar Cliente */}
                  <button onClick={() => handleClienteArchive(cliente)} className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Formulario de Cliente */}
          <div className="bg-white rounded-lg shadow-md w-full max-w-md border border-gray-300">
            {/* Cabecera del formulario */}
            <h3 className="text-xl font-bold text-white bg-[#14213D] p-4 rounded-t-lg">
              {editMode ? "Editar Cliente" : "Agregar Cliente"}
            </h3>

            {/* Contenido del formulario */}
            <div className="p-6">
              <form onSubmit={editMode ? handleEdit : handleRegister}>
                <div className="mb-4">
                  <label className="block text-[#14213D] font-semibold">Nombre</label>
                  <input
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className="w-full p-3 border border-[#E5E7EB] rounded-md text-[#14213D] bg-white focus:ring-2 focus:ring-[#14213D] focus:outline-none"
                    placeholder="Juan Pérez"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-[#14213D] font-semibold">RFC</label>
                  <input
                    type="text"
                    value={rfc}
                    onChange={(e) => setRfc(e.target.value)}
                    className="w-full p-3 border border-[#E5E7EB] rounded-md text-[#14213D] bg-white focus:ring-2 focus:ring-[#14213D] focus:outline-none"
                    placeholder="VIVR879895"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-[#14213D] font-semibold">Correo</label>
                  <input
                    type="email"
                    value={correo}
                    onChange={(e) => setCorreo(e.target.value)}
                    className="w-full p-3 border border-[#E5E7EB] rounded-md text-[#14213D] bg-white focus:ring-2 focus:ring-[#14213D] focus:outline-none"
                    placeholder="correo@gmail.com"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-[#14213D] font-semibold">Teléfono</label>
                  <input
                    type="tel"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    className="w-full p-3 border border-[#E5E7EB] rounded-md text-[#14213D] bg-white focus:ring-2 focus:ring-[#14213D] focus:outline-none"
                    placeholder="098765412"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-[#14213D] font-semibold">Dirección</label>
                  <input
                    type="text"
                    value={direccion}
                    onChange={(e) => setDireccion(e.target.value)}
                    className="w-full p-3 border border-[#E5E7EB] rounded-md text-[#14213D] bg-white focus:ring-2 focus:ring-[#14213D] focus:outline-none"
                    placeholder="Calle 123, Ciudad"
                    required
                  />
                </div>

                {/* Botón Agregar/Actualizar */}
                <button
                  type="submit"
                  className="w-full bg-[#FCA311] text-white font-semibold py-3 rounded-md hover:bg-[#E08E00] transition"
                >
                  {editMode ? "Actualizar Cliente" : "Agregar"}
                </button>
              </form>
            </div>
          </div>
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
      
       {/* Modal de confirmación de eliminación */}
       {showDeleteModal && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-md w-96">
            <h3 className="text-lg font-semibold text-[#14213D]">¿Seguro que quieres eliminar este cliente?, al eliminarlo se ira al apartado de archivados</h3>
            <div className="mt-4 flex justify-end gap-4">
              <button onClick={cancelarEliminacion} className="px-4 py-2 bg-gray-400 text-white rounded">
                Cancelar
              </button>
              <button onClick={confirmarEliminacion} className="px-4 py-2 bg-red-500 text-white rounded">
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
