'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';

interface Cliente {
  Nombre: string;
  RFC: string;
  Correo: string;
  Telefono: string;
  Direccion: string;
}

interface Factura {
  FacturaID: number;
  UUID: string;
  FechaEmision: string;
  Total: number;
  Estatus: string;
  EnlacePDF: string | null;
  EnlaceXML: string | null;
}

const ClienteDashboard = () => {
  const router = useRouter();
  const { ClienteID } = useParams();
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [facturas, setFacturas] = useState<Factura[]>([]);
  const [error, setError] = useState('');

  const fetchCliente = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("Usuario no autenticado");
        setError("No tienes permisos para ver esta información.");
        return;
      }

      const response = await axios.get(`http://localhost:3001/api/clientedashboard/${ClienteID}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setCliente(response.data);
    } catch (err) {
      console.error('Error al obtener los datos del cliente:', err);
      setError('No se pudo cargar la información del cliente.');
    }
  }, [ClienteID]);

  const fetchFacturas = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("Usuario no autenticado");
        setError("No tienes permisos para ver esta información.");
        return;
      }

      const response = await axios.get(`http://localhost:3001/api/facturas/cliente/${ClienteID}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setFacturas(response.data);
    } catch (err) {
      console.error('Error al obtener las facturas:', err);
      setError('No se pudieron cargar las facturas.');
    }
  }, [ClienteID]);

  useEffect(() => {
    fetchCliente();
    fetchFacturas();
  }, [fetchCliente, fetchFacturas]);

  return (
    <div className="p-6 bg-gray-100 min-h-screen flex flex-col items-center">
      <button
        onClick={() => router.push('/Clientes')}
        className="mb-6 bg-blue-500 text-white py-2 px-6 rounded-md hover:bg-blue-600 transition"
      >
        ← Volver
      </button>

      <h2 className="text-3xl font-bold text-gray-800 mb-6">Información del Cliente</h2>

      {error && <p className="text-red-500">{error}</p>}

      {cliente ? (
        <div className="w-full max-w-lg bg-white shadow-md rounded-lg overflow-hidden mb-8">
          <table className="w-full text-left border-collapse">
            <tbody>
              <tr className="bg-gray-200">
                <td className="p-4 font-semibold text-gray-800">Nombre:</td>
                <td className="p-4 text-gray-800">{cliente.Nombre}</td>
              </tr>
              <tr className="border-t">
                <td className="p-4 font-semibold text-gray-800">RFC:</td>
                <td className="p-4 text-gray-800">{cliente.RFC}</td>
              </tr>
              <tr className="bg-gray-200 border-t">
                <td className="p-4 font-semibold text-gray-800">Correo:</td>
                <td className="p-4 text-gray-800">{cliente.Correo}</td>
              </tr>
              <tr className="border-t">
                <td className="p-4 font-semibold text-gray-800">Teléfono:</td>
                <td className="p-4 text-gray-800">{cliente.Telefono}</td>
              </tr>
              <tr className="bg-gray-200 border-t">
                <td className="p-4 font-semibold text-gray-800">Dirección:</td>
                <td className="p-4 text-gray-800">{cliente.Direccion}</td>
              </tr>
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-600">Cargando información...</p>
      )}

      {/* Sección de Facturas */}
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Facturas del Cliente</h2>

      {facturas.length > 0 ? (
        <div className="w-full max-w-4xl bg-white shadow-md rounded-lg overflow-hidden">
          <table className="w-full border-collapse">
            <thead className="bg-blue-500 text-white">
              <tr>
                <th className="p-3 text-left">UUID</th>
                <th className="p-3 text-left">Fecha</th>
                <th className="p-3 text-left">Total</th>
                <th className="p-3 text-left">Estatus</th>
                <th className="p-3 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {facturas.map((factura) => (
                <tr key={factura.FacturaID} className="border-t">
                  <td className="p-3">{factura.UUID}</td>
                  <td className="p-3">{new Date(factura.FechaEmision).toLocaleDateString()}</td>
                  <td className="p-3">${factura.Total.toFixed(2)}</td>
                  <td className={`p-3 font-semibold ${factura.Estatus === 'Cancelada' ? 'text-red-500' : 'text-green-600'}`}>
                    {factura.Estatus}
                  </td>
                  <td className="p-3 flex space-x-2">
                    {factura.EnlacePDF && (
                      <a href={factura.EnlacePDF} target="_blank" className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition">
                        PDF
                      </a>
                    )}
                    {factura.EnlaceXML && (
                      <a href={factura.EnlaceXML} target="_blank" className="bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700 transition">
                        XML
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-600">Este cliente no tiene facturas registradas.</p>
      )}
    </div>
  );
};

export default ClienteDashboard;
