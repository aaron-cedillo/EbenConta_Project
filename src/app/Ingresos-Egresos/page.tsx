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
    <div className="min-h-screen flex flex-col bg-[#14213D] p-6">
      {/* Encabezado */}
      <div className="flex justify-between items-center px-8 py-4 bg-white shadow-md rounded-lg">
        <h2 className="text-2xl font-semibold text-[#14213D]">{`Bienvenido, ${userName || "Cargando..."}`}</h2>
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/ContadorDashboard')}
            className="px-6 py-3 bg-[#FCA311] text-white font-semibold rounded-lg hover:bg-[#E08E00] focus:ring-2 focus:ring-[#FCA311] transition"
          >
            Volver al menú
          </button>
          <button
            onClick={handleLogout}
            className="px-6 py-3 bg-[#E63946] text-white font-semibold rounded-lg hover:bg-[#D62839] transition"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>
  
      {/* Barra de búsqueda (ocupa toda la vista) */}
      <div className="mt-6 flex justify-center">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar cliente..."
          className="w-full max-w-7xl p-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#FCA311] text-[#14213D] shadow-md text-lg"
        />
      </div>
  
      {/* Lista de clientes (ocupa toda la vista) */}
      <div className="mt-6 w-full flex justify-center">
        <div className="w-full max-w-7xl space-y-4">
          {filteredClientes.length === 0 ? (
            <p className="text-gray-300 text-center text-lg">No se encontraron clientes.</p>
          ) : (
            filteredClientes.map(cliente => (
              <div key={cliente.ClienteID} className="bg-white border p-6 rounded-lg shadow-lg flex justify-between items-center w-full">
                <div className="text-[#14213D]">
                  <h3 className="text-lg font-semibold">{cliente.Nombre}</h3>
                  <p className="text-sm text-gray-500">{cliente.RFC}</p>
                </div>
                <button
                  onClick={() => router.push(`/IE/${cliente.ClienteID}`)}
                  className="px-6 py-3 bg-[#4CAF50] text-white rounded-lg hover:bg-[#388E3C] transition"
                >
                  Ingresos-Egresos
                </button>
              </div>
            ))
          )}
        </div>
      </div>
  
      {/* Modal de confirmación de cierre de sesión */}
      {showLogoutModal && (
        <div className="fixed inset-0 flex justify-center items-center bg-[#14213D] bg-opacity-50">
          <div className="bg-white p-6 rounded-lg w-96 shadow-lg border-2 border-[#FCA311]">
            <h3 className="text-lg font-semibold text-[#14213D]">¿Seguro que quieres cerrar sesión?</h3>
            <p className="mt-2 text-[#14213D]">Se cerrará tu sesión y deberás volver a iniciar sesión.</p>
            <div className="mt-4 flex justify-end gap-4">
              <button
                onClick={cancelarLogout}
                className="px-4 py-2 bg-[#6C757D] text-white rounded-lg hover:bg-[#545B62] transition"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarLogout}
                className="px-4 py-2 bg-[#D62828] text-white rounded-lg hover:bg-[#A12020] transition"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}  

export default IngresosEgresos;
