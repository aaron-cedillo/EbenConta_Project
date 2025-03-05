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
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("Usuario no autenticado");
        return;
      }

      // Incluimos el token en los encabezados de la solicitud
      const response = await axios.get('http://localhost:3001/api/clientes', {
        headers: {
          Authorization: `Bearer ${token}`,  // Aquí se envía el token
        },
      });
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

      await axios.post('http://localhost:3001/api/clientes', newCliente, {
        headers: {
          Authorization: `Bearer ${token}`,  // Aquí se envía el token
        },
      });
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
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("Usuario no autenticado");
        return;
      }

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
        await axios.put(`http://localhost:3001/api/clientes/${selectedId}`, updatedData, {
          headers: {
            Authorization: `Bearer ${token}`,  // Aquí se envía el token
          },
        });
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

  const handleClienteArchive = (cliente: Cliente) => {
    setSelectedCliente(cliente);
    setShowDeleteModal(true);
  };

  const confirmarEliminacion = () => {
    if (selectedCliente) {
      handleArchiveCliente(selectedCliente.ClienteID);
    }
    setShowDeleteModal(false);
  };

  const cancelarEliminacion = () => {
    setShowDeleteModal(false);
  };

  const handleArchiveCliente = async (clienteId: number) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("Usuario no autenticado");
        return;
      }
  
      await axios.put(`http://localhost:3001/api/clientes/archivar/${clienteId}`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      alert("Cliente archivado correctamente");
  
      // Filtrar los clientes para que desaparezcan de la lista actual
      setClientes(clientes.filter((cliente) => cliente.ClienteID !== clienteId));
      setFilteredClientes(filteredClientes.filter((cliente) => cliente.ClienteID !== clienteId));
  
    } catch (error) {
      console.error("Error al archivar cliente:", error);
      alert("Hubo un error al archivar el cliente.");
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
            required
            className="mt-2 p-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="flex justify-between items-center">
          <button
            type="submit"
            className="bg-indigo-500 text-white py-2 px-6 rounded-md hover:bg-indigo-600 focus:ring-2 focus:ring-indigo-500"
          >
            {editMode ? 'Actualizar Cliente' : 'Registrar Cliente'}
          </button>
          {editMode && (
            <button
              type="button"
              onClick={resetForm}
              className="text-red-500 hover:text-red-600"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      {message && (
        <div className="mb-4 text-green-500">{message}</div>
      )}
      {errorMessage && (
        <div className="mb-4 text-red-500">{errorMessage}</div>
      )}

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
                    onClick={() => router.push(`/ClienteDashboard/${cliente.ClienteID}`)}
                    className="bg-blue-500 text-white py-1 px-3 rounded-md hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 mr-2"
                  >
                    Ver Cliente
                  </button>
                  <button
                    onClick={() => handleEditClient(cliente)}
                    className="bg-indigo-500 text-white py-1 px-3 rounded-md hover:bg-indigo-600 focus:ring-2 focus:ring-indigo-500"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleClienteArchive(cliente)}
                    className="ml-2 bg-red-500 text-white py-1 px-3 rounded-md hover:bg-red-600 focus:ring-2 focus:ring-red-500 mr-2"
                  >
                    Eliminar
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

      {showDeleteModal && (
        <div className="fixed inset-0 flex justify-center items-center bg-gray-800 bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <p>¿Estás seguro de que deseas eliminar este cliente?, al aceptar se ira al apartado de archivados</p>
            <div className="mt-4 flex justify-end space-x-4">
              <button
                onClick={cancelarEliminacion}
                className="bg-gray-200 text-gray-800 py-2 px-4 rounded-md"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarEliminacion}
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

export default Clientes;
