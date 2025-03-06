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
    <div className="p-6 bg-gray-50">
      {/* Encabezado */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">{`Bienvenido, ${userName || "Cargando..."}`}</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition w-full sm:w-auto"
        >
          Cerrar Sesión
        </button>
      </div>

      <button onClick={() => router.push("/Ingresos-Egresos")} className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md">
        Volver al Dashboard de Ingresos y Egresos
      </button>

      {/* Filtro por fecha */}
      <div className="mt-4">
        <label>Fecha Inicio:</label>
        <input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} />
        <label className="ml-4">Fecha Fin:</label>
        <input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} />
        <button onClick={fetchResumenFacturas} className="ml-4 bg-green-600 text-white px-4 py-2 rounded-md">
          Filtrar
        </button>
      </div>

      {/* Botón de exportar a Excel */}
      <button onClick={exportarAExcel} className="mt-4 bg-green-600 text-white px-4 py-2 rounded-md">
        Exportar a Excel
      </button>

      {/* Tabla de Facturas */}
      <table className="mt-6 w-full bg-white">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Monto</th>
            <th>Tipo</th>
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
              <tr key={index}>
                <td>{factura.Fecha}</td>
                <td>{factura.Total !== undefined ? factura.Total.toFixed(2) : "0.00"}</td>
                <td>{factura.Tipo === "I" ? "Ingreso" : "Egreso"}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      {/* Totales de Ingresos y Egresos */}
      <div className="mt-6 flex justify-between text-sm font-semibold text-gray-700">
        <p>Total Ingresos: ${totalIngreso.toFixed(2)}</p>
        <p>Total Egresos: ${totalEgreso.toFixed(2)}</p>
      </div>

      {/* Modal de confirmación de cierre de sesión */}
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
                onClick={() => {
                  setIsModalOpen(false);
                  router.push("/login");
                }}
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
