"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { logoutUser, getUserName } from "@/app/services/authService";
import axios from "axios";
import { FaHome, FaUser, FaFolderOpen, FaDollarSign } from "react-icons/fa";

interface Alerta {
  AlertaID: number;
  Tipo: string;
  FechaVencimiento: string;
  Estado: string;
  NombreClientes: string;
}

export default function ContadorDashboard() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [clienteNombre, setClienteNombre] = useState("");
  const [tipo, setTipo] = useState("");
  const [fechaVencimiento, setFechaVencimiento] = useState("");
  const [estado, setEstado] = useState("Pendiente");
  const [alertaSeleccionada, setAlertaSeleccionada] = useState<number | null>(null);
  const [totalClientes, setTotalClientes] = useState<number>(0);
  const [totalFacturas, setTotalFacturas] = useState<number>(0);


  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const storedUserName = getUserName();
    setUserName(storedUserName);
    obtenerAlertas();
    obtenerTotalClientes();
    obtenerTotalFacturas();

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

  const obtenerAlertas = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:3001/api/alertas", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAlertas(response.data);
    } catch (error) {
      console.error("Error al obtener las alertas", error);
    }
  };

  const handleAgregarAlerta = async () => {
    if (!clienteNombre || !tipo || !fechaVencimiento) {
      alert("Todos los campos son obligatorios.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:3001/api/alertas",
        { NombreClientes: clienteNombre, Tipo: tipo, FechaVencimiento: fechaVencimiento, Estado: estado },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Alerta agregada correctamente");
      setClienteNombre("");
      setTipo("");
      setFechaVencimiento("");
      setEstado("Pendiente");
      obtenerAlertas();
    } catch (error) {
      console.error("Error al agregar alerta:", error);
      alert("Hubo un error al agregar la alerta.");
    }
  };

  const handleEliminarAlerta = async (alertaID: number) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:3001/api/alertas/${alertaID}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("Alerta eliminada correctamente.");
      obtenerAlertas(); 
    } catch (error) {
      console.error("Error al eliminar alerta:", error);
      alert("Hubo un error al eliminar la alerta.");
    }
  };

  const handleCambiarEstado = async (alertaID: number | null) => {
    if (!alertaID) return;

    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:3001/api/alertas/${alertaID}/estado`,
        { Estado: "Atendida" }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Estado de alerta actualizado.");
      obtenerAlertas(); 
    } catch (error) {
      console.error("Error al cambiar el estado de la alerta:", error);
      alert("Hubo un error al actualizar el estado de la alerta.");
    }
  };

  const obtenerTotalClientes = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:3001/api/estadisticas/clientes/total", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTotalClientes(response.data.total);
    } catch (error) {
      console.error("Error al obtener el total de clientes:", error);
    }
  };

  const obtenerTotalFacturas = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:3001/api/estadisticas/facturas/total", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTotalFacturas(response.data.total);
    } catch (error) {
      console.error("Error al obtener el total de facturas:", error);
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

      {/* Contenido principal */}
      <div className="flex-1 p-8">
        {/* Encabezado */}
        <div className="flex justify-between items-center bg-white p-4 shadow rounded-lg">
          <h2 className="text-2xl font-bold text-[#14213D]">Dashboard</h2>
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

        {/* Métricas de clientes y facturas */}
        <div className="grid grid-cols-2 gap-6 mt-6">
          {/* Clientes */}
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-[#14213D] text-white flex items-center justify-center rounded-full">
              <FaUser size={30} />
            </div>
            <p className="text-gray-400 text-sm mt-2">Clientes</p>
            <p className="text-2xl font-bold text-[#14213D]">{totalClientes}</p>
          </div>

          {/* Facturas Generadas */}
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-[#FCA311] text-white flex items-center justify-center rounded-full">
              <FaFolderOpen size={30} />
            </div>
            <p className="text-gray-400 text-sm mt-2">Facturas generadas</p>
            <p className="text-2xl font-bold text-[#14213D]">{totalFacturas}</p>
          </div>
        </div>

        {/* Notificaciones y formulario */}
        <div className="grid grid-cols-3 gap-6 mt-6">
          {/* Notificaciones */}
          <div className="col-span-2 bg-white p-6 rounded-2xl shadow-lg">
            <h3 className="text-2xl font-bold text-[#14213D] mb-4">Notificaciones</h3>
            <ul className="space-y-6">
              {alertas.map((alerta) => (
                <li key={alerta.AlertaID} className="flex items-center justify-between bg-[#F8F9FA] p-4 rounded-lg shadow-md">
                  <div>
                    <p className="text-[#14213D] font-semibold text-lg">{alerta.Tipo}</p>
                    <p className="text-gray-500 text-sm">{alerta.NombreClientes}</p>
                    <p className="text-gray-500 text-sm">Fecha: {new Date(alerta.FechaVencimiento).toLocaleDateString()}</p>
                  </div>
                  <div className="flex gap-2">
                    {/* Botón para marcar como atendida o pendiente */}
                    {alerta.Estado === "Pendiente" ? (
                      <button
                        onClick={() => setAlertaSeleccionada(alerta.AlertaID)}
                        className="px-4 py-2 bg-[#FCA311] text-white font-medium rounded-lg hover:bg-[#E08E00] transition"
                      >
                        Marcar como Atendida
                      </button>
                    ) : (
                      <span className="px-4 py-2 bg-[#2D6A4F] text-white font-medium rounded-lg">
                        Atendida
                      </span>
                    )}

                    {/* Botón para eliminar la alerta */}
                    <button
                      onClick={() => handleEliminarAlerta(alerta.AlertaID)}
                      className="px-4 py-2 bg-[#D62828] text-white font-medium rounded-lg hover:bg-[#A12020] transition"
                    >
                      Eliminar
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Formulario de alerta */}
          <div className="bg-white rounded-lg shadow-md w-full max-w-sm border border-gray-300">
            {/* Cabecera del formulario */}
            <h3 className="text-xl font-bold text-white bg-[#14213D] p-4 rounded-t-lg">
              Agregar notificación
            </h3>
            {/* Contenido del formulario */}
            <div className="p-6">
              {/* Cliente */}
              <div className="mb-4">
                <label className="block text-[#14213D] font-semibold">Cliente</label>
                <input
                  type="text"
                  value={clienteNombre}
                  onChange={(e) => setClienteNombre(e.target.value)}
                  className="w-full p-3 border border-[#E5E7EB] rounded-md text-[#14213D] bg-white focus:ring-2 focus:ring-[#14213D] focus:outline-none"
                  placeholder="Juan Pérez"
                />
              </div>

              {/* Tipo de alerta */}
              <div className="mb-4">
                <label className="block text-[#14213D] font-semibold">Tipo de alerta</label>
                <input
                  type="text"
                  value={tipo}
                  onChange={(e) => setTipo(e.target.value)}
                  className="w-full p-3 border border-[#E5E7EB] rounded-md text-[#14213D] bg-white focus:ring-2 focus:ring-[#14213D] focus:outline-none"
                  placeholder="Vencimiento de impuesto"
                />
              </div>

              {/* Fecha de vencimiento */}
              <div className="mb-4">
                <label className="block text-[#14213D] font-semibold">Fecha de vencimiento</label>
                <input
                  type="date"
                  value={fechaVencimiento}
                  onChange={(e) => setFechaVencimiento(e.target.value)}
                  className="w-full p-3 border border-[#E5E7EB] rounded-md text-[#14213D] bg-white focus:ring-2 focus:ring-[#14213D] focus:outline-none"
                />
              </div>

              {/* Botón Agregar */}
              <button
                onClick={handleAgregarAlerta}
                className="w-full bg-[#FCA311] text-white font-semibold py-3 rounded-md hover:bg-[#E08E00] transition"
              >
                Agregar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de confirmación para marcar alerta como atendida */}
      {alertaSeleccionada && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-md w-96">
            <h3 className="text-lg font-semibold text-[#14213D]">¿Marcar alerta como atendida?</h3>
            <p className="mt-2 text-[#14213D]">Esta alerta cambiará su estado a &quot;Atendida&quot;.</p>
            <div className="mt-4 flex justify-end gap-4">
              <button onClick={() => setAlertaSeleccionada(null)} className="px-4 py-2 bg-gray-400 text-white rounded">
                Cancelar
              </button>
              <button
                onClick={() => {
                  if (alertaSeleccionada !== null) {
                    handleCambiarEstado(alertaSeleccionada);
                    setAlertaSeleccionada(null);
                  }
                }}
                className="px-4 py-2 bg-green-500 text-white rounded"
              >
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
  );
}
