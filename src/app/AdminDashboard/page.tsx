"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { getUserName, logoutUser } from "../services/authService";
import { FaUser, FaEdit, FaTrash } from "react-icons/fa";

interface Contador {
  UsuarioID: number;
  Nombre: string;
  Correo: string;
  Contrasena?: string;
  FechaExpiracion: string;
  Rol: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [contadores, setContadores] = useState<Contador[]>([]);
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [fechaExpiracion, setFechaExpiracion] = useState("");
  const [filteredContadores, setFilteredContadores] = useState<Contador[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [userName, setUserName] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedContador, setSelectedContador] = useState<Contador | null>(
    null
  );
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchContadores();
    const storedUserName = getUserName();
    if (storedUserName) setUserName(storedUserName);

    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setIsModalOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredContadores(contadores);
    } else {
      setFilteredContadores(
        contadores.filter(
          (contador) =>
            contador.Nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            contador.Correo.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
  }, [searchTerm, contadores]);

  const fetchContadores = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3001/api/admin/contadores"
      );
      setContadores(response.data);
      setFilteredContadores(response.data);
    } catch (error) {
      console.error("Error al obtener contadores:", error);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        nombre,
        correo,
        contrasena: contrasena || undefined,
        fechaExpiracion,
      };

      if (editMode && selectedId !== null) {
        // Editar contador
        await axios.put(
          `http://localhost:3001/api/admin/editar/${selectedId}`,
          data
        );
      } else {
        // Agregar nuevo contador
        await axios.post("http://localhost:3001/api/admin/registrar", {
          ...data,
          Rol: "contador",
        });
      }

      resetForm();
      fetchContadores();
    } catch (error) {
      console.error("Error al registrar/editar contador:", error);
    }
  };

  const handleEdit = (contador: Contador) => {
    setNombre(contador.Nombre || "");
    setCorreo(contador.Correo || "");
    setContrasena("");
    setFechaExpiracion(contador.FechaExpiracion || "");
    setSelectedId(contador.UsuarioID);
    setEditMode(true);
  };

  const resetForm = () => {
    setNombre("");
    setCorreo("");
    setContrasena("");
    setFechaExpiracion("");
    setEditMode(false);
    setSelectedId(null);
  };

  const handleDeleteContador = (contador: Contador) => {
    setSelectedContador(contador);
    setShowDeleteModal(true);
  };

  const confirmarEliminacion = async () => {
    if (!selectedContador) return;

    try {
      await axios.delete(`http://localhost:3001/api/admin/eliminar/${selectedContador.UsuarioID}`);
      setContadores((prevContadores) => prevContadores.filter((c) => c.UsuarioID !== selectedContador.UsuarioID));
      setFilteredContadores((prevFiltered) => prevFiltered.filter((c) => c.UsuarioID !== selectedContador.UsuarioID));
    } catch (error) {
      console.error("Error al eliminar contador:", error);
    }

    setShowDeleteModal(false);
    setSelectedContador(null);
  };

  const handleLogout = () => {
    logoutUser();
    router.push("/login");
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar vacío */}
      <div className="w-64 bg-[#14213D] text-white p-6 flex flex-col">
        <h1 className="text-2xl font-bold mb-6">
          eben<span className="text-[#FCA311]">Conta</span>
        </h1>
      </div>

      {/* Contenido */}
      <div className="flex-1 p-8">
        {/* Encabezado */}
        <div className="flex justify-between items-center bg-white p-4 shadow rounded-lg">
          <h2 className="text-2xl font-bold text-[#14213D]">Administrador</h2>
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
            placeholder="Buscar contador..."
            className="w-full max-w-7xl p-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#FCA311] text-[#14213D] shadow-md text-lg"
          />
        </div>

        {/* Contenedor Principal para organizar lista y formulario */}
        <div className="grid grid-cols-3 gap-6 mt-6">
          {/* Lista de Contadores */}
          <div className="col-span-2 bg-white p-6 rounded-lg shadow">
            {filteredContadores.length === 0 ? (
              <p className="text-gray-300 text-center text-lg">No se encontraron contadores.</p>
            ) : (
              filteredContadores.map((contador) => (
                <div
                  key={contador.UsuarioID}
                  className="flex justify-between items-center border-b py-4"
                >
                  {/* Información del Contador */}
                  <div>
                    <h3 className="text-lg font-bold text-[#14213D]">{contador.Nombre}</h3>
                    <p className="text-gray-500">{contador.Correo}</p>
                    <p className="text-gray-500">
                      Expira: {new Date(contador.FechaExpiracion).toLocaleDateString("es-ES")}
                    </p>
                  </div>

                  {/* Botones de Acción */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(contador)}
                      className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDeleteContador(contador)}
                      className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Formulario de Contador con nuevo diseño */}
          <div className="bg-white rounded-lg shadow-md w-full border border-gray-300">
            {/* Cabecera del formulario */}
            <h3 className="text-xl font-bold text-white bg-[#14213D] p-4 rounded-t-lg">
              {editMode ? "Editar Contador" : "Agregar Contador"}
            </h3>

            {/* Contenido del formulario */}
            <div className="p-6">
              <form onSubmit={handleRegister}>
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
                  <label className="block text-[#14213D] font-semibold">Contraseña</label>
                  <input
                    type="password"
                    value={contrasena}
                    onChange={(e) => setContrasena(e.target.value)}
                    className="w-full p-3 border border-[#E5E7EB] rounded-md text-[#14213D] bg-white focus:ring-2 focus:ring-[#14213D] focus:outline-none"
                    placeholder="********"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-[#14213D] font-semibold">Fecha de Expiración</label>
                  <input
                    type="date"
                    value={fechaExpiracion}
                    onChange={(e) => setFechaExpiracion(e.target.value)}
                    className="w-full p-3 border border-[#E5E7EB] rounded-md text-[#14213D] bg-white focus:ring-2 focus:ring-[#14213D] focus:outline-none"
                  />
                </div>

                {/* Botón Agregar/Actualizar */}
                <button
                  type="submit"
                  className="w-full bg-[#FCA311] text-white font-semibold py-3 rounded-md hover:bg-[#E08E00] transition"
                >
                  {editMode ? "Actualizar Contador" : "Agregar"}
                </button>
              </form>
            </div>
          </div>
        </div>

        {showDeleteModal && selectedContador && (
          <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-md w-96">
              <h3 className="text-lg font-semibold text-[#14213D]">
                ¿Seguro que quieres eliminar a {selectedContador.Nombre}?
              </h3>
              <div className="mt-4 flex justify-end gap-4">
                <button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 bg-gray-400 text-white rounded">
                  Cancelar
                </button>
                <button onClick={confirmarEliminacion} className="px-4 py-2 bg-red-500 text-white rounded">
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de confirmación de cierre de sesión */}
        {showLogoutModal && (
          <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-md w-96">
              <h3 className="text-lg font-semibold text-[#14213D]">
                ¿Seguro que quieres cerrar sesión?
              </h3>
              <div className="mt-4 flex justify-end gap-4">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="px-4 py-2 bg-gray-400 text-white rounded"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-500 text-white rounded"
                >
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
