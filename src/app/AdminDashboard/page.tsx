import { useState, useEffect } from 'react';
import axios from 'axios';

// Definir la interfaz para el contador
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
  // Estados para el formulario de registro
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [fechaExpiracion, setFechaExpiracion] = useState('');
  const [message, setMessage] = useState('');

  // Estado para la lista de contadores
  const [contadores, setContadores] = useState<Contador[]>([]);

  // Función para registrar a un contador
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Petición POST para registrar al contador
      await axios.post('http://localhost:3001/api/users/register', {
        nombre,
        correo,
        contrasena,
        fechaExpiracion,
        rol: 'contador', // Aquí se asigna el rol 'contador'
      });
      setMessage('Contador registrado exitosamente');
      // Limpiar el formulario después de registrar
      setNombre('');
      setCorreo('');
      setContrasena('');
      setFechaExpiracion('');
      // Recargar la lista de contadores
      fetchContadores();
    } catch (error) {
      console.error('Error al registrar contador:', error);
      setMessage('Error al registrar contador');
    }
  };

  // Función para obtener los contadores registrados
  const fetchContadores = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/users');
      setContadores(response.data); // Usar `response.data` para actualizar la lista de contadores
    } catch (error) {
      console.error('Error al obtener contadores:', error);
    }
  };

  // Función para eliminar un contador
  const handleDelete = async (contadorId: number) => {
    try {
      await axios.delete(`http://localhost:3001/api/users/${contadorId}`);
      setContadores(contadores.filter(contador => contador.UsuarioID !== contadorId));
      setMessage('Contador eliminado exitosamente');
    } catch (error) {
      console.error('Error al eliminar contador:', error);
      setMessage('Error al eliminar contador');
    }
  };

  // Función para editar un contador
  const handleEdit = (contadorId: number) => {
    // Lógica para editar el contador (esto puede ser más avanzado dependiendo de cómo quieres manejar la edición)
    // Puede ser un modal o una navegación a otra página
    console.log('Editar contador con ID:', contadorId);
  };

  // Ejecutar fetchContadores cuando la página se carga
  useEffect(() => {
    fetchContadores();
  }, []);

  return (
    <div>
      <h2>Registrar Contador</h2>
      <form onSubmit={handleRegister}>
        <div>
          <label>Nombre</label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Correo</label>
          <input
            type="email"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Contraseña</label>
          <input
            type="password"
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Fecha de expiración (YYYY-MM-DD)</label>
          <input
            type="date"
            value={fechaExpiracion}
            onChange={(e) => setFechaExpiracion(e.target.value)}
            required
          />
        </div>
        <button type="submit">Registrar Contador</button>
      </form>
      {message && <p>{message}</p>}

      <h2>Contadores Registrados</h2>
      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Correo</th>
            <th>Fecha de Expiración</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {contadores.map((contador) => (
            <tr key={contador.UsuarioID}>
              <td>{contador.Nombre}</td>
              <td>{contador.Correo}</td>
              <td>{contador.FechaExpiracion}</td>
              <td>
                <button onClick={() => handleEdit(contador.UsuarioID)}>Editar</button>
                <button onClick={() => handleDelete(contador.UsuarioID)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminDashboard;
