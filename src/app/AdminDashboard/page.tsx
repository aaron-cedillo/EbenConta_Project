'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';

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
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [fechaExpiracion, setFechaExpiracion] = useState('');
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [contadores, setContadores] = useState<Contador[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  useEffect(() => {
    fetchContadores();
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
    setErrorMessage('');  // Resetear mensaje de error al intentar registrar
    try {
      if (editMode && selectedId !== null) {
        // Modo edición: Actualizar contador existente
        await axios.put(`http://localhost:3001/api/admin/editar/${selectedId}`, {
          nombre,
          correo,
          contrasena,
          fechaExpiracion,
          rol: 'contador',
        });
        setMessage('Contador actualizado exitosamente');
      } else {
        // Modo creación: Registrar nuevo contador
        await axios.post('http://localhost:3001/api/users/register', {
          nombre,
          correo,
          contrasena,
          fechaExpiracion,
          rol: 'contador',
        });
        setMessage('Contador registrado exitosamente');
      }

      resetForm();
      fetchContadores(); // Actualizar lista
    } catch (error) {
      console.error('Error al registrar/editar contador:', error);
      setErrorMessage('Error al procesar la solicitud');
    }
  };

  const handleDelete = async (contadorId: number) => {
    try {
      await axios.delete(`http://localhost:3001/api/admin/eliminar/${contadorId}`);
      setMessage('Contador eliminado exitosamente');
      // Actualizar la lista sin hacer un fetch completo
      setContadores(contadores.filter((contador) => contador.UsuarioID !== contadorId));
    } catch (error) {
      console.error('Error al eliminar contador:', error);
      setErrorMessage('Error al eliminar contador');
    }
  };

  const handleEdit = (contador: Contador) => {
    setNombre(contador.Nombre || ''); // Asegurar que no sea null
    setCorreo(contador.Correo || ''); // Asegurar que no sea null
    setContrasena(''); // No mostrar la contraseña actual
    setFechaExpiracion(contador.FechaExpiracion || ''); // Asegurar que no sea null
    setSelectedId(contador.UsuarioID);
    setEditMode(true);
  };

  const resetForm = () => {
    setNombre('');
    setCorreo('');
    setContrasena('');
    setFechaExpiracion('');
    setEditMode(false);
    setSelectedId(null);
  };

  return (
    <div className="p-6 bg-gray-50">
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
            required={!editMode} 
            className="mt-2 p-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Fecha de Expiración</label>
          <input
            type="date"
            value={fechaExpiracion}
            onChange={(e) => setFechaExpiracion(e.target.value)}
            required
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
                <button onClick={() => handleDelete(contador.UsuarioID)} className="bg-red-500 text-white py-1 px-3 rounded-md hover:bg-red-600 focus:ring-2 focus:ring-red-500">
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminDashboard;
