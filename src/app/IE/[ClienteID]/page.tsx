"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import { getUserName } from "../../services/authService";
import * as XLSX from "xlsx";
import { FaHome, FaUser, FaDollarSign, FaFolderOpen } from "react-icons/fa";

interface FacturaResumen {
  Fecha: string;
  Total: number;
  Tipo: "I" | "E";
}

export default function IngresosEgresos() {
  const router = useRouter();
  const { ClienteID } = useParams();
  const [userName, setUserName] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [facturas, setFacturas] = useState<FacturaResumen[]>([]);
  const [totalIngreso, setTotalIngreso] = useState<number>(0);
  const [totalEgreso, setTotalEgreso] = useState<number>(0);
  const [fechaInicio, setFechaInicio] = useState<string>("");
  const [fechaFin, setFechaFin] = useState<string>("");
  const [clienteNombre, setClienteNombre] = useState<string>("");

  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const storedUserName = getUserName();
    if (storedUserName) {
      setUserName(storedUserName);
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsModalOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchClienteNombre = async () => {
      if (!ClienteID) return;

      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`http://localhost:3001/api/clientes/${ClienteID}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setClienteNombre(response.data.Nombre || "Cliente Desconocido");
      } catch (error) {
        console.error("Error al obtener el nombre del cliente:", error);
        setClienteNombre("Cliente Desconocido");
      }
    };

    fetchClienteNombre();
  }, [ClienteID]);

  const fetchResumenFacturas = useCallback(async () => {
    if (!ClienteID) return;

    try {
      const token = localStorage.getItem("token");
      const response = await axios.get<FacturaResumen[]>(
        `http://localhost:3001/api/facturas/cliente/${ClienteID}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { fechaInicio, fechaFin },
        }
      );

      const facturasLimpias = response.data.map((factura) => ({
        Fecha: factura.Fecha || "Desconocida",
        Total: factura.Total ?? 0,
        Tipo: factura.Tipo,
      }));

      setFacturas(facturasLimpias);

      setTotalIngreso(
        facturasLimpias.filter((factura) => factura.Tipo === "I").reduce((sum, factura) => sum + factura.Total, 0)
      );

      setTotalEgreso(
        facturasLimpias.filter((factura) => factura.Tipo === "E").reduce((sum, factura) => sum + factura.Total, 0)
      );
    } catch (error) {
      console.error("Error al obtener las facturas:", error);
    }
  }, [ClienteID, fechaInicio, fechaFin]);

  const exportarAExcel = (tipo?: "I" | "E") => {
    let datosAExportar = facturas;

    if (tipo) {
      datosAExportar = facturas.filter((factura) => factura.Tipo === tipo);
    }

    if (datosAExportar.length === 0) {
      console.error("No hay facturas para exportar.");
      return;
    }

    const worksheetData = [
      ["Fecha", "Monto", "Tipo"],
      ...datosAExportar.map((factura) => [
        factura.Fecha,
        factura.Total,
        factura.Tipo === "I" ? "Ingreso" : "Egreso",
      ]),
      [],
      ["", "Total:", datosAExportar.reduce((sum, factura) => sum + factura.Total, 0)],
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Resumen");

    let fileName = `facturas_${clienteNombre.replace(/\s+/g, "_")}.xlsx`;
    if (tipo === "I") fileName = `ingresos_${clienteNombre.replace(/\s+/g, "_")}.xlsx`;
    if (tipo === "E") fileName = `egresos_${clienteNombre.replace(/\s+/g, "_")}.xlsx`;

    XLSX.writeFile(workbook, fileName);
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
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
          <h2 className="text-2xl font-bold text-[#14213D]">Ingresos y Egresos</h2>
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

        {/* Sección de Filtro y Totales */}
        <div className="mt-6 flex justify-between items-center max-w-6xl mx-auto">
          {/* Filtro de Fechas */}
          <div className="bg-white p-6 rounded-lg shadow-lg border-2 border-[#FCA311] flex items-center gap-4 w-[500px]">
            <div className="flex flex-col">
              <label className="block text-[#14213D] font-semibold">Fecha de Inicio</label>
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#FCA311] text-[#14213D] bg-gray-100 w-full"
              />
            </div>
            <div className="flex flex-col">
              <label className="block text-[#14213D] font-semibold">Fecha de Fin</label>
              <input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className="p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#FCA311] text-[#14213D] bg-gray-100 w-full"
              />
            </div>

            {/* Botón de búsqueda estilizado */}
            <button
              onClick={fetchResumenFacturas}
              className="w-14 h-14 flex items-center justify-center bg-[#14213D] text-white rounded-lg hover:bg-[#0E1A2B] transition shadow-md"
            >
              🔍
            </button>
          </div>

          {/* Totales de Ingresos y Egresos */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4 bg-white p-4 rounded-lg shadow-md">
              <div className="w-12 h-12 flex items-center justify-center bg-[#14213D] text-white rounded-full">
                💰
              </div>
              <div>
                <p className="text-[#14213D] text-lg">Ingresos</p>
                <p className="text-2xl font-bold text-[#14213D]">${totalIngreso.toFixed(2)}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-white p-4 rounded-lg shadow-md">
              <div className="w-12 h-12 flex items-center justify-center bg-[#FCA311] text-white rounded-full">
                📅
              </div>
              <div>
                <p className="text-[#14213D] text-lg">Egresos</p>
                <p className="text-2xl font-bold text-[#FCA311]">${totalEgreso.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>


      {/* Botones de exportación */}
      <div className="flex justify-center gap-4 mt-6">
        <button onClick={() => exportarAExcel("I")} className="px-6 py-3 bg-[#FCA311] text-white font-semibold rounded-lg hover:bg-[#E08E00] transition">
          Exportar Ingresos
        </button>
        <button onClick={() => exportarAExcel("E")} className="px-6 py-3 bg-[#D62828] text-white font-semibold rounded-lg hover:bg-[#A12020] transition">
          Exportar Egresos
        </button>
        <button onClick={() => exportarAExcel()} className="px-6 py-3 bg-[#4CAF50] text-white font-semibold rounded-lg hover:bg-[#388E3C] transition">
          Exportar Todos
        </button>
      </div>

      {/* Lista de Facturas */}
      <div className="mt-6 bg-white p-6 rounded-lg shadow-lg max-w-4xl mx-auto">
        <h2 className="text-xl font-semibold text-[#14213D] mb-4">Lista de Facturas</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse rounded-lg shadow-lg">
            <thead>
              <tr className="bg-[#FCA311] text-white">
                <th className="p-3 text-left">Fecha</th>
                <th className="p-3 text-left">Monto</th>
                <th className="p-3 text-left">Tipo</th>
              </tr>
            </thead>
            <tbody>
              {facturas.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-3 text-center text-gray-500">
                    No se encontraron facturas.
                  </td>
                </tr>
              ) : (
                facturas.map((factura, index) => (
                  <tr key={index} className="border-b hover:bg-gray-100 transition">
                    <td className="p-3 text-[#14213D]">{factura.Fecha}</td>
                    <td className="p-3 text-[#14213D]">
                      ${factura.Total.toFixed(2)}
                    </td>
                    <td
                      className={`p-3 font-semibold ${factura.Tipo === "I" ? "text-green-600" : "text-red-600"
                        }`}
                    >
                      {factura.Tipo === "I" ? "Ingreso" : "Egreso"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de confirmación de cierre de sesión */}
      {showLogoutModal && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-md w-96 border-2 border-[#FCA311]">
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
