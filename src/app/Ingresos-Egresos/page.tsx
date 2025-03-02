'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { getUserName } from '../services/authService';

interface Cliente {
  ClienteID: number;
  Nombre: string;
  RFC: string;
  Correo: string;
  Telefono: string;
  Direccion: string;
  UsuarioID: number;
}

const IngresosEgresos = () => {
  const router = useRouter();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [filteredClientes, setFilteredClientes] = useState<Cliente[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [userName, setUserName] = useState('');
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    fetchClientes();
    const storedUserName = getUserName();
    if (storedUserName) {
      setUserName(storedUserName);
    }
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
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

      const response = await axios.get('http://localhost:3001/api/clientes', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setClientes(response.data);
      setFilteredClientes(response.data);
    } catch (error) {
      console.error('Error al obtener clientes:', error);
    }
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmarLogout = () => {
    setShowLogoutModal(false);
    router.push('/login');
  };

  const cancelarLogout = () => {
    setShowLogoutModal(false);
  };

  return (
    <div className="p-6 bg-gray-50">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">{`Bienvenido, ${userName || 'Cargando...'}`}</h2>
        <button
          onClick={handleLogout}
          className="text-red-500 font-semibold hover:text-red-600 focus:ring-2 focus:ring-red-500"
        >
          Cerrar sesión
        </button>
      </div>

      <button
        onClick={() => router.push('/ContadorDashboard')}
        className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 mb-4"
      >
        Volver
      </button>

      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Buscar cliente"
        className="w-full mb-6 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
      />

      <div className="space-y-4">
        {filteredClientes.length === 0 ? (
          <p>No se encontraron clientes.</p>
        ) : (
          filteredClientes.map(cliente => (
            <div key={cliente.ClienteID} className="border p-4 rounded-md shadow-sm">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold">{cliente.Nombre}</h3>
                  <p className="text-sm text-gray-500">{cliente.RFC}</p>
                </div>
                <div>
                  <button
                    onClick={() => router.push(`/IE/${cliente.ClienteID}`)}
                    className="bg-blue-500 text-white py-1 px-3 rounded-md hover:bg-blue-600 focus:ring-2 focus:ring-blue-500"
                  >
                    Ingresos-Egresos
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showLogoutModal && (
        <div className="fixed inset-0 flex justify-center items-center bg-gray-800 bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <p>¿Estás seguro de que deseas cerrar sesión?</p>
            <div className="mt-4 flex justify-end space-x-4">
              <button
                onClick={cancelarLogout}
                className="bg-gray-200 text-gray-800 py-2 px-4 rounded-md"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarLogout}
                className="bg-red-500 text-white py-2 px-4 rounded-md"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IngresosEgresos;
