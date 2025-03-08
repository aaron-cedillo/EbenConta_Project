"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation"; // useParams para obtener ClienteID
import axios from "axios";
import { getUserName } from "../../services/authService"; // Eliminamos getUserId porque ya no lo necesitamos
import * as XLSX from "xlsx";

interface FacturaResumen {
  Fecha: string;
  Total: number;
  Tipo: "I" | "E";
}

export default function IngresosEgresos() {
  const router = useRouter();
  const { ClienteID } = useParams(); // Obtenemos ClienteID desde la URL
  const [userName, setUserName] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [facturas, setFacturas] = useState<FacturaResumen[]>([]);
  const [totalIngreso, setTotalIngreso] = useState<number>(0);
  const [totalEgreso, setTotalEgreso] = useState<number>(0);
  const [fechaInicio, setFechaInicio] = useState<string>("");
  const [fechaFin, setFechaFin] = useState<string>("");
  const [clienteNombre, setClienteNombre] = useState<string>("");

  useEffect(() => {
    const fetchClienteNombre = async () => {
      if (!ClienteID) return;
  
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `http://localhost:3001/api/clientes/${ClienteID}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
  
        if (response.data && response.data.Nombre) {
          setClienteNombre(response.data.Nombre);
        } else {
          setClienteNombre("ClienteDesconocido");
        }
      } catch (error) {
        console.error("Error al obtener el nombre del cliente:", error);
        setClienteNombre("ClienteDesconocido");
      }
    };
  
    fetchClienteNombre();
  }, [ClienteID]);

  useEffect(() => {
    const storedUserName = getUserName();
    if (storedUserName) {
      setUserName(storedUserName);
    }

    if (!ClienteID) {
      console.error("⚠️ No se encontró el ClienteID en la URL.");
    } else {
      console.log(`🔍 ClienteID obtenido de la URL: ${ClienteID}`);
    }
  }, [ClienteID]);

  const fetchResumenFacturas = useCallback(async () => {
    if (!ClienteID) {
      console.warn("🚨 Intento de obtener facturas sin ClienteID.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("⚠️ Usuario no autenticado.");
        return;
      }

      console.log(`🔍 Buscando facturas para ClienteID: ${ClienteID}`);

      const response = await axios.get<FacturaResumen[]>(
        `http://localhost:3001/api/facturas/cliente/${ClienteID}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { fechaInicio, fechaFin },
        }
      );

      // Validamos que `Total` siempre tenga un valor válido
      const facturasLimpias = response.data.map((factura) => ({
        Fecha: factura.Fecha || "Desconocida",
        Total: factura.Total ?? 0, // Si Total es null o undefined, lo convertimos en 0
        Tipo: factura.Tipo,
      }));

      setFacturas(facturasLimpias);

      const totalIngreso = facturasLimpias
        .filter((factura) => factura.Tipo === "I")
        .reduce((sum, factura) => sum + factura.Total, 0);

      const totalEgreso = facturasLimpias
        .filter((factura) => factura.Tipo === "E")
        .reduce((sum, factura) => sum + factura.Total, 0);

      setTotalIngreso(totalIngreso);
      setTotalEgreso(totalEgreso);
    } catch (error) {
      console.error("❌ Error al obtener las facturas:", error);
    }
  }, [ClienteID, fechaInicio, fechaFin]);


  const exportarAExcel = () => {
    if (facturas.length === 0) {
      console.error("No hay facturas para exportar.");
      return;
    }
  
    const worksheet = XLSX.utils.json_to_sheet(
      facturas.map((factura) => ({
        Fecha: factura.Fecha,
        Monto: factura.Total.toFixed(2),
        Tipo: factura.Tipo === "I" ? "Ingreso" : "Egreso",
      }))
    );
  
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Facturas");
  
    // Asegurar que el nombre no tenga espacios ni caracteres especiales
    const fileName = `facturas_${clienteNombre.replace(/\s+/g, "_")}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };  

  useEffect(() => {
    if (ClienteID) {
      fetchResumenFacturas();
    }
  }, [fetchResumenFacturas, ClienteID]);

  return (
    <div className="min-h-screen flex flex-col bg-[#14213D] p-6">
      {/* Encabezado */}
      <div className="flex justify-between items-center px-8 py-4 bg-white shadow-md rounded-lg">
        <h2 className="text-2xl font-semibold text-[#14213D]">{`Bienvenido, ${userName || "Cargando..."}`}</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-6 py-3 bg-[#E63946] text-white font-semibold rounded-lg hover:bg-[#D62839] transition"
        >
          Cerrar Sesión
        </button>
      </div>
  
      {/* Botón de navegación */}
      <div className="flex justify-center mt-6">
        <button
          onClick={() => router.push("/Ingresos-Egresos")}
          className="px-4 py-2 bg-[#FCA311] text-white rounded-lg hover:bg-[#E08E00] transition"
        >
          Volver al menu de Ingresos y Egresos
        </button>
      </div>
  
      {/* Filtro por fecha */}
      <div className="mt-4 bg-white p-6 rounded-lg shadow-lg max-w-2xl mx-auto">
        <h2 className="text-lg font-semibold text-[#14213D] mb-4">Filtrar por Fecha</h2>
        <div className="flex items-center gap-4">
          <div>
            <label className="block text-[#14213D] font-medium">Fecha Inicio:</label>
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#FCA311] text-[#14213D]"
            />
          </div>
          <div>
            <label className="block text-[#14213D] font-medium">Fecha Fin:</label>
            <input
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#FCA311] text-[#14213D]"
            />
          </div>
          <button
            onClick={fetchResumenFacturas}
            className="px-4 py-2 bg-[#4CAF50] text-white rounded-lg hover:bg-[#388E3C] transition"
          >
            Filtrar
          </button>
        </div>
      </div>
  
      {/* Botón de exportar a Excel */}
      <div className="flex justify-center mt-4">
        <button
          onClick={exportarAExcel}
          className="px-6 py-3 bg-[#4CAF50] text-white font-semibold rounded-lg hover:bg-[#388E3C] transition"
        >
          Exportar a Excel
        </button>
      </div>
  
      {/* Tabla de Facturas */}
      <div className="mt-6 bg-white p-6 rounded-lg shadow-lg max-w-4xl mx-auto">
        <h2 className="text-xl font-semibold text-[#14213D] mb-4">Facturas</h2>
        <table className="w-full table-auto border-collapse rounded-lg shadow-lg">
          <thead>
            <tr className="bg-[#FCA311] text-white">
              <th className="py-2 px-4">Fecha</th>
              <th className="py-2 px-4">Monto</th>
              <th className="py-2 px-4">Tipo</th>
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
                  <td className="py-2 px-4 text-[#14213D]">{factura.Fecha}</td>
                  <td className="py-2 px-4 text-[#14213D]">
                    {factura.Total !== undefined ? factura.Total.toFixed(2) : "0.00"}
                  </td>
                  <td className={`py-2 px-4 font-semibold ${
                    factura.Tipo === "I" ? "text-green-600" : "text-red-600"
                  }`}>
                    {factura.Tipo === "I" ? "Ingreso" : "Egreso"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
  
      {/* Totales de Ingresos y Egresos */}
      <div className="mt-6 flex justify-between text-lg font-semibold text-white max-w-4xl mx-auto bg-[#FCA311] p-4 rounded-lg shadow-md">
        <p>Total Ingresos: ${totalIngreso.toFixed(2)}</p>
        <p>Total Egresos: ${totalEgreso.toFixed(2)}</p>
      </div>
  
      {/* Modal de confirmación de cierre de sesión */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-[#14213D] bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96 border-2 border-[#FCA311]">
            <h2 className="text-lg font-semibold text-[#14213D]">Confirmar cierre de sesión</h2>
            <p className="mt-2 text-[#14213D]">¿Estás seguro de que quieres cerrar sesión?</p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-[#6C757D] text-white rounded-lg hover:bg-[#545B62] transition"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  router.push("/login");
                }}
                className="px-4 py-2 bg-[#D62828] text-white rounded-lg hover:bg-[#A12020] transition"
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
