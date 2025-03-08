'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { getUserName } from '../services/authService'; // Importar la función para obtener el nombre

interface Contador {
  UsuarioID: number;
  Nombre: string;
  Correo: string;
  Contrasena: string;
  FechaExpiracion: string;
  Rol: string;
  FechaRegistro: string;
}

const AdminDashboard = () => {
  const router = useRouter();
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [fechaExpiracion, setFechaExpiracion] = useState('');
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [contadores, setContadores] = useState<Contador[]>([]);
  const [filteredContadores, setFilteredContadores] = useState<Contador[]>([]); // Nuevo estado para los contadores filtrados
  const [editMode, setEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false); // Control para el modal de logout
  const [userName, setUserName] = useState(''); // Nombre del usuario logueado
  const [showDeleteModal, setShowDeleteModal] = useState(false); // Control para el modal de eliminación
  const [selectedContador, setSelectedContador] = useState<Contador | null>(null); // Contador seleccionado para eliminar
  const [initialPassword, setInitialPassword] = useState(''); // Para guardar la contraseña inicial
  const [searchTerm, setSearchTerm] = useState(''); // Estado para el término de búsqueda

  useEffect(() => {
    fetchContadores();
    // Obtener el nombre del usuario desde localStorage
    const storedUserName = getUserName();
    if (storedUserName) {
      setUserName(storedUserName); // Establecer el nombre del usuario
    }
  }, []);

  useEffect(() => {
    // Filtrar contadores por nombre o correo cada vez que cambie el término de búsqueda
    if (searchTerm.trim() === '') {
      setFilteredContadores(contadores); // Mostrar todos los contadores si no hay término de búsqueda
    } else {
      setFilteredContadores(
        contadores.filter(
          (contador) =>
            contador.Nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            contador.Correo.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
  }, [searchTerm, contadores]);

  const fetchContadores = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/users');
      const filteredContadores = response.data.filter((contador: Contador) => contador.Rol === 'contador');
      setContadores(filteredContadores);
      setFilteredContadores(filteredContadores); // Inicializamos la lista de contadores filtrados
    } catch (error) {
      console.error('Error al obtener contadores:', error);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    try {
      const updatedData: { nombre: string, correo: string, fechaExpiracion?: string, rol: string, contrasena: string } = {
        nombre,
        correo,
        fechaExpiracion: fechaExpiracion || undefined,
        rol: 'contador',
        contrasena: contrasena || initialPassword, // Aseguramos que la contraseña esté siempre presente
      };

      if (editMode && selectedId !== null) {
        // Enviar la solicitud de actualización
        await axios.put(`http://localhost:3001/api/admin/editar/${selectedId}`, updatedData);
        setMessage('Contador actualizado exitosamente');
      } else {
        await axios.post('http://localhost:3001/api/users/register', updatedData);
        setMessage('Contador registrado exitosamente');
      }

      resetForm();
      fetchContadores(); // Actualizar lista
    } catch (error) {
      console.error('Error al registrar/editar contador:', error);
      setErrorMessage('Error al procesar la solicitud');
    }
  };

  const handleEdit = (contador: Contador) => {
    setNombre(contador.Nombre || '');
    setCorreo(contador.Correo || '');
    setContrasena(''); // Inicializamos contrasena vacía
    setFechaExpiracion(contador.FechaExpiracion || '');
    setSelectedId(contador.UsuarioID);
    setInitialPassword(contador.Contrasena); // Guardar la contraseña inicial
    setEditMode(true);
  };

  const resetForm = () => {
    setNombre('');
    setCorreo('');
    setContrasena('');
    setFechaExpiracion('');
    setEditMode(false);
    setSelectedId(null);
    setInitialPassword(''); // Limpiar la contraseña inicial
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

  const handleDeleteContador = (contador: Contador) => {
    setSelectedContador(contador);
    setShowDeleteModal(true);
  };

  const confirmarEliminacion = () => {
    if (selectedContador) {
      handleDelete(selectedContador.UsuarioID);
    }
    setShowDeleteModal(false);
  };

  const cancelarEliminacion = () => {
    setShowDeleteModal(false);
  };

  // Función para eliminar el contador
  const handleDelete = async (contadorId: number) => {
    try {
      await axios.delete(`http://localhost:3001/api/admin/eliminar/${contadorId}`);
      setMessage('Contador eliminado exitosamente');
      setContadores(contadores.filter((contador) => contador.UsuarioID !== contadorId));
      setFilteredContadores(filteredContadores.filter((contador) => contador.UsuarioID !== contadorId)); // Actualizamos los contadores filtrados
    } catch (error) {
      console.error('Error al eliminar contador:', error);
      setErrorMessage('Error al eliminar contador');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#14213D] p-6">
      {/* Encabezado */}
      <div className="flex justify-between items-center px-8 py-4 bg-white shadow-md rounded-lg">
        <h1 className="text-2xl font-semibold text-[#14213D]">Bienvenido, {userName}</h1>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition"
        >
          Cerrar Sesión
        </button>
      </div>
  
      {/* Contenido Principal */}
      <h2 className="text-2xl font-semibold text-white mt-6 mb-6">
        {editMode ? "Editar Contador" : "Registrar Contador"}
      </h2>
  
      <form onSubmit={handleRegister} className="bg-white p-6 rounded-lg shadow-lg mb-8">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Nombre</label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
            className="mt-2 p-3 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-[#FCA311] text-black"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Correo</label>
          <input
            type="email"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            required
            className="mt-2 p-3 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-[#FCA311] text-black"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Contraseña</label>
          <input
            type="password"
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
            placeholder="******"
            className="mt-2 p-3 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-[#FCA311] text-black"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Fecha de Expiración</label>
          <input
            type="date"
            value={fechaExpiracion}
            onChange={(e) => setFechaExpiracion(e.target.value)}
            className="mt-2 p-3 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-[#FCA311] text-black"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-[#FCA311] text-white py-3 rounded-md hover:bg-[#E08E00] focus:ring-2 focus:ring-[#FCA311]"
        >
          {editMode ? "Actualizar Contador" : "Registrar Contador"}
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
          placeholder="Buscar contador..."
          className="p-3 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-[#FCA311] text-black"
        />
      </div>
  
      <h2 className="text-2xl font-semibold text-white mt-12 mb-6">Contadores Registrados</h2>
      <table className="w-full table-auto border-collapse bg-white rounded-lg shadow-lg">
        <thead>
          <tr className="bg-[#FCA311] text-white text-left text-sm font-semibold">
            <th className="py-2 px-4 text-black">Nombre</th>
            <th className="py-2 px-4 text-black">Correo</th>
            <th className="py-2 px-4 text-black">Fecha Expiración</th>
            <th className="py-2 px-4 text-black">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filteredContadores.map((contador) => (
            <tr key={contador.UsuarioID} className="border-b">
              <td className="py-2 px-4 text-sm text-black">{contador.Nombre}</td>
              <td className="py-2 px-4 text-sm text-black">{contador.Correo}</td>
              <td className="py-2 px-4 text-sm text-black">{contador.FechaExpiracion}</td>
              <td className="py-2 px-4 text-sm">
                <button onClick={() => handleEdit(contador)} className="bg-blue-500 text-white py-1 px-3 rounded-md hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 mr-2">
                  Editar
                </button>
                <button onClick={() => handleDeleteContador(contador)} className="bg-red-500 text-white py-1 px-3 rounded-md hover:bg-red-600 focus:ring-2 focus:ring-red-500">
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
  
      {/* Modal para confirmar cierre de sesión */}
      {showLogoutModal && (
        <div className="fixed inset-0 flex justify-center items-center bg-gray-900 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-black">
            <h3 className="text-lg font-semibold">¿Estás seguro que deseas cerrar sesión?</h3>
            <div className="flex justify-between mt-4">
              <button onClick={cancelarLogout} className="bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600">
                Cancelar
              </button>
              <button onClick={confirmarLogout} className="bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600">
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      )}
  
      {/* Modal de confirmación de eliminación */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex justify-center items-center bg-gray-900 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-black">
            <h3 className="text-lg font-semibold">¿Estás seguro que deseas eliminar este contador?</h3>
            <div className="flex justify-between mt-4">
              <button onClick={cancelarEliminacion} className="bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600">
                Cancelar
              </button>
              <button onClick={confirmarEliminacion} className="bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600">
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};  

export default AdminDashboard;
