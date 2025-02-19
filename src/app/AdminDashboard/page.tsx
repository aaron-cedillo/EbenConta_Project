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
  const [editMode, setEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false); // Control para el modal de logout
  const [userName, setUserName] = useState(''); // Nombre del usuario logueado
  const [showDeleteModal, setShowDeleteModal] = useState(false); // Control para el modal de eliminación
  const [selectedContador, setSelectedContador] = useState<Contador | null>(null); // Contador seleccionado para eliminar
  const [initialPassword, setInitialPassword] = useState(''); // Para guardar la contraseña inicial

  useEffect(() => {
    fetchContadores();
    // Obtener el nombre del usuario desde localStorage
    const storedUserName = getUserName();
    if (storedUserName) {
      setUserName(storedUserName); // Establecer el nombre del usuario
    }
  }, []);

  const fetchContadores = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/users');
      const filteredContadores = response.data.filter((contador: Contador) => contador.Rol === 'contador');
      setContadores(filteredContadores);
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
    } catch (error) {
      console.error('Error al eliminar contador:', error);
      setErrorMessage('Error al eliminar contador');
    }
  };

  return (
    <div className="p-6 bg-gray-50">
      {/* Encabezado */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">{`Bienvenido, ${userName || 'Cargando...'}`}</h2>
        <button
          onClick={handleLogout}
          className="text-red-500 font-semibold hover:text-red-600 focus:ring-2 focus:ring-red-500"
        >
          Cerrar sesión
        </button>
      </div>

      <h2 className="text-2xl font-semibold text-gray-800 mb-6">
        {editMode ? 'Editar Contador' : 'Registrar Contador'}
      </h2>
      <form onSubmit={handleRegister} className="bg-white p-6 rounded-lg shadow-lg mb-8">
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
          <label className="block text-sm font-medium text-gray-700">Contraseña</label>
          <input
            type="password"
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
            placeholder="******" // Placeholder con asteriscos
            className="mt-2 p-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Fecha de Expiración</label>
          <input
            type="date"
            value={fechaExpiracion}
            onChange={(e) => setFechaExpiracion(e.target.value)}
            className="mt-2 p-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <button type="submit" className="w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600 focus:ring-2 focus:ring-green-500">
          {editMode ? 'Actualizar Contador' : 'Registrar Contador'}
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

      <h2 className="text-2xl font-semibold text-gray-800 mt-12 mb-6">Contadores Registrados</h2>
      <table className="w-full table-auto border-collapse bg-white rounded-lg shadow-lg">
        <thead>
          <tr className="bg-gray-100 text-left text-sm font-semibold text-gray-700">
            <th className="py-2 px-4">Nombre</th>
            <th className="py-2 px-4">Correo</th>
            <th className="py-2 px-4">Fecha Expiración</th>
            <th className="py-2 px-4">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {contadores.map((contador) => (
            <tr key={contador.UsuarioID} className="border-b">
              <td className="py-2 px-4 text-sm">{contador.Nombre}</td>
              <td className="py-2 px-4 text-sm">{contador.Correo}</td>
              <td className="py-2 px-4 text-sm">{contador.FechaExpiracion}</td>
              <td className="py-2 px-4 text-sm">
                <button onClick={() => handleEdit(contador)} className="bg-orange-500 text-white py-1 px-3 rounded-md hover:bg-orange-600 focus:ring-2 focus:ring-orange-500 mr-2">
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
        <div className="fixed inset-0 flex justify-center items-center bg-gray-600 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold">¿Estás seguro que deseas cerrar sesión?</h3>
            <div className="flex justify-between mt-4">
              <button onClick={cancelarLogout} className="bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600">Cancelar</button>
              <button onClick={confirmarLogout} className="bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600">Cerrar sesión</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex justify-center items-center bg-gray-600 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold">¿Estás seguro que deseas eliminar este contador?</h3>
            <div className="flex justify-between mt-4">
              <button onClick={cancelarEliminacion} className="bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600">Cancelar</button>
              <button onClick={confirmarEliminacion} className="bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600">Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
