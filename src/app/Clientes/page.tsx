'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { getUserName, getUserId } from '../services/authService';

interface Cliente {
  ClienteID: number;
  Nombre: string;
  RFC: string;
  Correo: string;
  Telefono: string;
  Direccion: string;
  UsuarioID: number;
}

const Clientes = () => {
  const router = useRouter();
  const [nombre, setNombre] = useState('');
  const [rfc, setRfc] = useState('');
  const [correo, setCorreo] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [filteredClientes, setFilteredClientes] = useState<Cliente[]>([]); 
  const [editMode, setEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false); 
  const [userName, setUserName] = useState(''); 
  const [showDeleteModal, setShowDeleteModal] = useState(false); 
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null); 
  const [searchTerm, setSearchTerm] = useState(''); 

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
            cliente.RFC.toLowerCase().includes(searchTerm.toLowerCase()) ||
            cliente.Correo.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
  }, [searchTerm, clientes]);

  const fetchClientes = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/clientes');
      setClientes(response.data);
      setFilteredClientes(response.data); 
    } catch (error) {
      console.error('Error al obtener clientes:', error);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
  
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("Usuario no autenticado");
        return;
      }
  
      const decodedToken = JSON.parse(atob(token.split(".")[1] || ""));
      const usuarioId = decodedToken?.id;
      if (!usuarioId) throw new Error("No se encontró el UsuarioID en el token");
  
      const newCliente = {
        nombre,
        rfc,
        correo,
        telefono,
        direccion,
        usuarioId,
      };
  
      await axios.post('http://localhost:3001/api/clientes', newCliente);
      setMessage('Cliente registrado exitosamente');
  
      resetForm();
      fetchClientes();
  
    } catch (error: unknown) {
      console.error('Error al registrar cliente:', error);
      if (error instanceof Error) {
        setErrorMessage(error.message || 'Error al procesar la solicitud');
      } else {
        setErrorMessage('Error desconocido al procesar la solicitud');
      }
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    try {
      const userId = getUserId();

      const updatedData = {
        nombre,
        rfc,
        correo,
        telefono,
        direccion,
        UsuarioID: userId,
      };

      if (selectedId !== null) {
        await axios.put(`http://localhost:3001/api/clientes/${selectedId}`, updatedData); 
        setMessage('Cliente actualizado exitosamente');
      }

      resetForm();
      fetchClientes(); 
    } catch (error) {
      console.error('Error al actualizar cliente:', error);
      setErrorMessage('Error al procesar la solicitud');
    }
  };

  const handleEditClient = (cliente: Cliente) => {
    setNombre(cliente.Nombre || '');
    setRfc(cliente.RFC || '');
    setCorreo(cliente.Correo || '');
    setTelefono(cliente.Telefono || '');
    setDireccion(cliente.Direccion || '');
    setSelectedId(cliente.ClienteID);
    setEditMode(true);
  };

  const resetForm = () => {
    setNombre('');
    setRfc('');
    setCorreo('');
    setTelefono('');
    setDireccion('');
    setEditMode(false);
    setSelectedId(null);
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

  const handleDeleteCliente = (cliente: Cliente) => {
    setSelectedCliente(cliente);
    setShowDeleteModal(true);
  };

  const confirmarEliminacion = () => {
    if (selectedCliente) {
      handleDelete(selectedCliente.ClienteID);
    }
    setShowDeleteModal(false);
  };

  const cancelarEliminacion = () => {
    setShowDeleteModal(false);
  };

  const handleDelete = async (clienteId: number) => {
    try {
      await axios.delete(`http://localhost:3001/api/clientes/${clienteId}`); 
      setMessage('Cliente eliminado exitosamente');
      setClientes(clientes.filter((cliente) => cliente.ClienteID !== clienteId));
      setFilteredClientes(filteredClientes.filter((cliente) => cliente.ClienteID !== clienteId)); 
    } catch (error) {
      console.error('Error al eliminar cliente:', error);
      setErrorMessage('Error al eliminar cliente');
    }
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

      <h2 className="text-2xl font-semibold text-gray-800 mb-6">
        {editMode ? 'Editar Cliente' : 'Registrar Cliente'}
      </h2>
      <form onSubmit={editMode ? handleEdit : handleRegister} className="bg-white p-6 rounded-lg shadow-lg mb-8">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Nombre</label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
            className="mt-2 p-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">RFC</label>
          <input
            type="text"
            value={rfc}
            onChange={(e) => setRfc(e.target.value)}
            required
            className="mt-2 p-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Correo</label>
          <input
            type="email"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            required
            className="mt-2 p-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Teléfono</label>
          <input
            type="tel"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            className="mt-2 p-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Dirección</label>
          <input
            type="text"
            value={direccion}
            onChange={(e) => setDireccion(e.target.value)}
            className="mt-2 p-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <button type="submit" className="w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600 focus:ring-2 focus:ring-green-500">
          {editMode ? 'Actualizar Cliente' : 'Registrar Cliente'}
        </button>
        {editMode && (
          <button
            type="button"
            onClick={resetForm}
            className="w-full mt-2 bg-gray-400 text-white py-2 rounded-md hover:bg-gray-500 focus:ring-2 focus:ring-gray-400"
          >
            Cancelar Edición
          </button>
        )}
      </form>

      {message && <p className="text-center text-green-600 font-semibold">{message}</p>}
      {errorMessage && <p className="text-center text-red-600 font-semibold">{errorMessage}</p>}

      <div className="mb-6">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar cliente..."
          className="p-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <h2 className="text-2xl font-semibold text-gray-800 mt-12 mb-6">Clientes Registrados</h2>
      <table className="w-full table-auto border-collapse bg-white rounded-lg shadow-lg">
        <thead>
          <tr className="bg-gray-100 text-left text-sm font-semibold text-gray-700">
            <th className="py-2 px-4">Nombre</th>
            <th className="py-2 px-4">RFC</th>
            <th className="py-2 px-4">Correo</th>
            <th className="py-2 px-4">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filteredClientes.map((cliente) => (
            <tr key={cliente.ClienteID} className="border-b">
              <td className="py-2 px-4 text-sm">{cliente.Nombre}</td>
              <td className="py-2 px-4 text-sm">{cliente.RFC}</td>
              <td className="py-2 px-4 text-sm">{cliente.Correo}</td>
              <td className="py-2 px-4 text-sm">
                <button onClick={() => handleEditClient(cliente)} className="bg-orange-500 text-white py-1 px-3 rounded-md hover:bg-orange-600 focus:ring-2 focus:ring-orange-500 mr-2">
                  Editar
                </button>
                <button onClick={() => handleDeleteCliente(cliente)} className="bg-red-500 text-white py-1 px-3 rounded-md hover:bg-red-600 focus:ring-2 focus:ring-red-500">
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal de confirmación de cierre de sesión */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">¿Seguro que deseas cerrar sesión?</h3>
            <div className="flex justify-end space-x-4">
              <button onClick={cancelarLogout} className="px-4 py-2 bg-gray-400 text-white rounded-md">Cancelar</button>
              <button onClick={confirmarLogout} className="px-4 py-2 bg-red-500 text-white rounded-md">Cerrar sesión</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
      {showDeleteModal && selectedCliente && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">¿Seguro que deseas eliminar este cliente?</h3>
            <div className="flex justify-end space-x-4">
              <button onClick={cancelarEliminacion} className="px-4 py-2 bg-gray-400 text-white rounded-md">Cancelar</button>
              <button onClick={confirmarEliminacion} className="px-4 py-2 bg-red-500 text-white rounded-md">Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Clientes;
