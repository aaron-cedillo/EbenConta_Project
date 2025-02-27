'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';

interface Cliente {
  ClienteID: number;
  Nombre: string;
  RFC: string;
  Correo: string;
  Telefono: string;
  Direccion: string;
}

const ClienteDashboard = () => {
  const router = useRouter();
  const { ClienteID } = useParams();
  const [cliente, setCliente] = useState<Cliente | null>(null);
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
  }, [ClienteID]); // ⬅️ Dependencias de useCallback

  useEffect(() => {
    fetchCliente();
  }, [fetchCliente]); // ⬅️ Ahora useEffect depende de fetchCliente

  return (
    <div className="p-6 bg-gray-50">
      <button 
        onClick={() => router.push('/ContadorDashboard')} 
        className="mb-4 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
      >
        Volver
      </button>

      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Información del Cliente</h2>

      {error && <p className="text-red-500">{error}</p>}

      {cliente ? (
        <table className="min-w-full bg-white border border-gray-300 rounded-lg shadow-md">
          <tbody>
            <tr>
              <td className="p-4 font-semibold border">ID:</td>
              <td className="p-4 border">{cliente.ClienteID}</td>
            </tr>
            <tr>
              <td className="p-4 font-semibold border">Nombre:</td>
              <td className="p-4 border">{cliente.Nombre}</td>
            </tr>
            <tr>
              <td className="p-4 font-semibold border">RFC:</td>
              <td className="p-4 border">{cliente.RFC}</td>
            </tr>
            <tr>
              <td className="p-4 font-semibold border">Correo:</td>
              <td className="p-4 border">{cliente.Correo}</td>
            </tr>
            <tr>
              <td className="p-4 font-semibold border">Teléfono:</td>
              <td className="p-4 border">{cliente.Telefono}</td>
            </tr>
            <tr>
              <td className="p-4 font-semibold border">Dirección:</td>
              <td className="p-4 border">{cliente.Direccion}</td>
            </tr>
          </tbody>
        </table>
      ) : (
        <p className="text-gray-600">Cargando información...</p>
      )}
    </div>
  );
};

export default ClienteDashboard;
