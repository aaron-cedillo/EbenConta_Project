'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { getUserName, getUserId } from '../../services/authService'; // Asegúrate de que getUserId esté disponible.

interface FacturaResumen {
  fecha: string;
  tipo: 'Ingreso' | 'Egreso';
  monto: number;
}

const IE = () => {
  const router = useRouter();
  const [userName, setUserName] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [facturas, setFacturas] = useState<FacturaResumen[]>([]);
  const [mes, setMes] = useState<number>(new Date().getMonth() + 1); // Mes actual
  const [año, setAño] = useState<number>(new Date().getFullYear()); // Año actual
  const [totalIngreso, setTotalIngreso] = useState<number>(0);
  const [totalEgreso, setTotalEgreso] = useState<number>(0);
  const [clienteID, setClienteID] = useState<number | null>(null); // ClienteID del usuario

  useEffect(() => {
    const storedUserName = getUserName();
    if (storedUserName) {
      setUserName(storedUserName);
    }

    // Obtener el ClienteID desde el authService
    const storedClienteID = getUserId(); // Suponiendo que esta función te da el ID del cliente
    setClienteID(storedClienteID ? parseInt(storedClienteID, 10) : null);
  }, []);

  const handleLogout = () => {
    setIsModalOpen(true);
  };

  const confirmarLogout = () => {
    setIsModalOpen(false);
    router.push('/login');
  };

  const cancelarLogout = () => {
    setIsModalOpen(false);
  };

  const fetchResumenFacturas = useCallback(async () => {
    if (!clienteID) {
      console.error('No se encontró el ClienteID');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('Usuario no autenticado');
        return;
      }

      // Realizamos la petición para obtener el resumen de facturas
      const response = await axios.get<FacturaResumen[]>(`http://localhost:3001/api/facturas/cliente/${clienteID}/resumen`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Filtrar las facturas del mes y año seleccionado
      const facturasFiltradas = response.data.filter((factura) => {
        const fechaFactura = new Date(factura.fecha);
        return (
          fechaFactura.getMonth() + 1 === mes && fechaFactura.getFullYear() === año
        );
      });

      setFacturas(facturasFiltradas);

      // Calcular totales
      const totalIngreso = facturasFiltradas
        .filter((factura) => factura.tipo === 'Ingreso')
        .reduce((sum, factura) => sum + factura.monto, 0);

      const totalEgreso = facturasFiltradas
        .filter((factura) => factura.tipo === 'Egreso')
        .reduce((sum, factura) => sum + factura.monto, 0);

      setTotalIngreso(totalIngreso);
      setTotalEgreso(totalEgreso);

    } catch (error) {
      console.error('Error al obtener las facturas:', error);
    }
  }, [mes, año, clienteID]); // Agregar clienteID como dependencia

  useEffect(() => {
    if (clienteID) {
      fetchResumenFacturas();
    }
  }, [fetchResumenFacturas, clienteID]); // Usar clienteID como dependencia

  return (
    <div className="p-6 bg-gray-50">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">{`Bienvenido, ${userName || 'Cargando...'}`}</h2>
        <button
          onClick={handleLogout}
          className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition w-full sm:w-auto"
        >
          Cerrar Sesión
        </button>
      </div>

      <button
        onClick={() => router.push('/Ingresos-Egresos')}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition w-full sm:w-auto mb-4"
      >
        Volver
      </button>

      <div className="mt-6 text-center">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">Ingresos y Egresos</h3>
        <p>Aquí podrás gestionar los ingresos y egresos de tus clientes.</p>
      </div>

      {/* Filtros de mes y año */}
      <div className="mb-6">
        <select
          value={mes}
          onChange={(e) => setMes(Number(e.target.value))}
          className="px-4 py-2 border rounded-md"
        >
          {[...Array(12)].map((_, index) => (
            <option key={index} value={index + 1}>
              {new Date(0, index).toLocaleString('default', { month: 'long' })}
            </option>
          ))}
        </select>

        <select
          value={año}
          onChange={(e) => setAño(Number(e.target.value))}
          className="ml-4 px-4 py-2 border rounded-md"
        >
          {[2023, 2024, 2025].map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      {/* Tabla de Facturas */}
      <table className="min-w-full bg-white border border-gray-300 rounded-md shadow-sm">
        <thead>
          <tr>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Fecha</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Tipo</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Monto</th>
          </tr>
        </thead>
        <tbody>
          {facturas.length === 0 ? (
            <tr>
              <td colSpan={3} className="px-6 py-3 text-center text-gray-500">
                No se encontraron facturas para este mes y año.
              </td>
            </tr>
          ) : (
            facturas.map((factura, index) => (
              <tr key={index}>
                <td className="px-6 py-3 text-sm text-gray-700">{new Date(factura.fecha).toLocaleDateString()}</td>
                <td className="px-6 py-3 text-sm text-gray-700">{factura.tipo}</td>
                <td className="px-6 py-3 text-sm text-gray-700">{factura.monto}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Totales de Ingresos y Egresos */}
      <div className="mt-6 flex justify-between text-sm font-semibold text-gray-700">
        <p>Total Ingresos: ${totalIngreso}</p>
        <p>Total Egresos: ${totalEgreso}</p>
      </div>

      {/* Modal de confirmación */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-lg font-semibold">Confirmar cierre de sesión</h2>
            <p className="mt-2 text-gray-600">¿Estás seguro de que quieres cerrar sesión?</p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={cancelarLogout}
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarLogout}
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
};

export default IE;
