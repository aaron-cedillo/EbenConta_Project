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
    <div className="min-h-screen flex flex-col bg-[#14213D] p-6">
      {/* Encabezado */}
      <div className="flex justify-between items-center px-8 py-4 bg-white shadow-md rounded-lg">
        <h2 className="text-2xl font-semibold text-[#14213D]">{`Bienvenido, ${userName || "Cargando..."}`}</h2>
        <div className="flex gap-4">
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

      {/* Formulario de Cliente */}
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl mx-auto mt-10">
      <h2 className="text-2xl font-semibold text-[#14213D] mb-6 text-center">
        {editMode ? "Editar Cliente" : "Registrar Cliente"}
      </h2>
      <form onSubmit={editMode ? handleEdit : handleRegister} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[#14213D] font-medium">Nombre</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              className="mt-2 p-3 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-[#FCA311] text-[#14213D] shadow-sm"
            />
          </div>
          <div>
            <label className="block text-[#14213D] font-medium">RFC</label>
            <input
              type="text"
              value={rfc}
              onChange={(e) => setRfc(e.target.value)}
              required
              className="mt-2 p-3 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-[#FCA311] text-[#14213D] shadow-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[#14213D] font-medium">Correo</label>
            <input
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              required
              className="mt-2 p-3 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-[#FCA311] text-[#14213D] shadow-sm"
            />
          </div>
          <div>
            <label className="block text-[#14213D] font-medium">Teléfono</label>
            <input
              type="tel"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              className="mt-2 p-3 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-[#FCA311] text-[#14213D] shadow-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-[#14213D] font-medium">Dirección</label>
          <input
            type="text"
            value={direccion}
            onChange={(e) => setDireccion(e.target.value)}
            required
            className="mt-2 p-3 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-[#FCA311] text-[#14213D] shadow-sm"
          />
        </div>

        <div className="flex justify-center mt-4">
          <button
            type="submit"
            className="bg-[#FCA311] text-white py-3 px-6 rounded-lg hover:bg-[#E08E00] focus:ring-2 focus:ring-[#FCA311] transition w-full"
          >
            {editMode ? "Actualizar Cliente" : "Registrar Cliente"}
          </button>
        </div>
      </form>
    </div>

      {/* Mensajes */}
      {message && <div className="text-center text-green-500 font-semibold mt-4">{message}</div>}
      {errorMessage && <div className="text-center text-red-500 font-semibold mt-4">{errorMessage}</div>}

      {/* Buscador de clientes */}
      <div className="mt-6 flex justify-center">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar cliente..."
          className="w-full max-w-7xl p-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#FCA311] text-[#14213D] shadow-md text-lg"
        />
      </div>

      {/* Lista de clientes */}
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
                <div className="flex gap-2">
                  <button
                    onClick={() => router.push(`/ClienteDashboard/${cliente.ClienteID}`)}
                    className="px-4 py-2 bg-[#4CAF50] text-white rounded-lg hover:bg-[#388E3C] transition"
                  >
                    Ver Cliente
                  </button>
                  <button
                    onClick={() => handleEditClient(cliente)}
                    className="px-4 py-2 bg-[#FCA311] text-white rounded-lg hover:bg-[#E08E00] transition"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleClienteArchive(cliente)}
                    className="px-4 py-2 bg-[#E63946] text-white rounded-lg hover:bg-[#D62839] transition"
                  >
                    Eliminar
                  </button>
                </div>
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

      {/* Modal de confirmación de eliminación */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex justify-center items-center bg-[#14213D] bg-opacity-50">
          <div className="bg-white p-6 rounded-lg w-96 shadow-lg border-2 border-[#FCA311]">
            <h3 className="text-lg font-semibold text-[#14213D]">Confirmar Eliminación</h3>
            <p className="mt-2 text-[#14213D]">
              ¿Estás seguro de que deseas eliminar este cliente? Se moverá al apartado de **Archivados**.
            </p>
            <div className="mt-4 flex justify-end gap-4">
              <button
                onClick={cancelarEliminacion}
                className="px-4 py-2 bg-[#6C757D] text-white rounded-lg hover:bg-[#545B62] transition"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarEliminacion}
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

export default Clientes;
